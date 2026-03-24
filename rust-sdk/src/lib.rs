use base64::{Engine as _, engine::general_purpose::STANDARD};
use image::imageops::{FilterType, overlay};
use image::{DynamicImage, GenericImageView, ImageFormat, RgbaImage};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

const MAX_RGB_DISTANCE: f64 = 441.6729559300637;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StitchImageInput {
    pub image_base64: String,
    pub width: u32,
    pub height: u32,
    pub offset_x: u32,
    pub offset_y: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StitchRequest {
    pub stitched_width: u32,
    pub stitched_height: u32,
    pub images: Vec<StitchImageInput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StitchResult {
    pub image_base64: String,
    pub stitched_width: u32,
    pub stitched_height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiffRequest {
    pub image1_base64: String,
    pub image2_base64: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiffResult {
    pub diff_percent: f64,
}

#[wasm_bindgen]
pub fn stitch_images(input: JsValue) -> Result<JsValue, JsValue> {
    let request: StitchRequest =
        serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let result = stitch_images_impl(request).map_err(|e| JsValue::from_str(&e))?;
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn compare_images(input: JsValue) -> Result<JsValue, JsValue> {
    let request: DiffRequest =
        serde_wasm_bindgen::from_value(input).map_err(|e| JsValue::from_str(&e.to_string()))?;
    let diff_percent = compare_images_base64(&request.image1_base64, &request.image2_base64)
        .map_err(|e| JsValue::from_str(&e))?;
    let result = DiffResult { diff_percent };
    serde_wasm_bindgen::to_value(&result).map_err(|e| JsValue::from_str(&e.to_string()))
}

fn stitch_images_impl(request: StitchRequest) -> Result<StitchResult, String> {
    if request.stitched_width == 0 || request.stitched_height == 0 {
        return Err("stitched_width 和 stitched_height 必须大于 0".to_string());
    }

    let mut canvas = RgbaImage::new(request.stitched_width, request.stitched_height);

    for item in request.images {
        let bytes = STANDARD
            .decode(&item.image_base64)
            .map_err(|e| format!("解码 base64 图片失败: {e}"))?;
        let mut image = image::load_from_memory(&bytes)
            .map_err(|e| format!("读取图片内存数据失败: {e}"))?;

        if image.width() != item.width || image.height() != item.height {
            image = image.resize_exact(item.width, item.height, FilterType::Lanczos3);
        }

        let right = item
            .offset_x
            .checked_add(item.width)
            .ok_or_else(|| "图片横向范围溢出".to_string())?;
        let bottom = item
            .offset_y
            .checked_add(item.height)
            .ok_or_else(|| "图片纵向范围溢出".to_string())?;

        if right > request.stitched_width || bottom > request.stitched_height {
            return Err(format!(
                "图片超出拼接画布范围: offset=({}, {}), size=({},{})",
                item.offset_x, item.offset_y, item.width, item.height
            ));
        }

        overlay(
            &mut canvas,
            &image.to_rgba8(),
            i64::from(item.offset_x),
            i64::from(item.offset_y),
        );
    }

    let mut png_bytes = Vec::new();
    DynamicImage::ImageRgba8(canvas)
        .write_to(&mut std::io::Cursor::new(&mut png_bytes), ImageFormat::Png)
        .map_err(|e| format!("编码 PNG 失败: {e}"))?;

    Ok(StitchResult {
        image_base64: STANDARD.encode(png_bytes),
        stitched_width: request.stitched_width,
        stitched_height: request.stitched_height,
    })
}

fn compare_images_base64(base64_1: &str, base64_2: &str) -> Result<f64, String> {
    let bytes_1 = STANDARD
        .decode(base64_1)
        .map_err(|e| format!("解码第一张图片失败: {e}"))?;
    let bytes_2 = STANDARD
        .decode(base64_2)
        .map_err(|e| format!("解码第二张图片失败: {e}"))?;

    let image1 = image::load_from_memory(&bytes_1).map_err(|e| format!("读取第一张图片失败: {e}"))?;
    let image2 = image::load_from_memory(&bytes_2).map_err(|e| format!("读取第二张图片失败: {e}"))?;

    compare_dynamic_images(&image1, &image2)
}

fn compare_dynamic_images(image1: &DynamicImage, image2: &DynamicImage) -> Result<f64, String> {
    let (width, height) = image1.dimensions();

    if width == 0 || height == 0 {
        return Err("图片尺寸不能为 0".to_string());
    }

    let image1_rgb = image1.to_rgb8();
    let image2_resized = if image2.dimensions() != (width, height) {
        image2.resize_exact(width, height, FilterType::Triangle)
    } else {
        image2.clone()
    };
    let image2_rgb = image2_resized.to_rgb8();

    let mut total_normalized_diff = 0.0_f64;

    for (pixel1, pixel2) in image1_rgb.pixels().zip(image2_rgb.pixels()) {
        let dr = pixel1[0] as f64 - pixel2[0] as f64;
        let dg = pixel1[1] as f64 - pixel2[1] as f64;
        let db = pixel1[2] as f64 - pixel2[2] as f64;

        let distance = (dr * dr + dg * dg + db * db).sqrt();
        total_normalized_diff += distance / MAX_RGB_DISTANCE;
    }

    let total_pixels = (width as f64) * (height as f64);
    Ok((total_normalized_diff / total_pixels) * 100.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use image::{DynamicImage, ImageBuffer, Rgba};

    #[test]
    fn compare_identical_images_should_be_zero() {
        let image = DynamicImage::ImageRgba8(ImageBuffer::from_pixel(2, 2, Rgba([10, 20, 30, 255])));
        let diff = compare_dynamic_images(&image, &image).expect("compare should succeed");
        assert_eq!(diff, 0.0);
    }

    #[test]
    fn stitch_empty_canvas_should_fail_on_zero_size() {
        let result = stitch_images_impl(StitchRequest {
            stitched_width: 0,
            stitched_height: 10,
            images: Vec::new(),
        });
        assert!(result.is_err());
    }
}
