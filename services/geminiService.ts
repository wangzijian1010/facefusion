import { DetectedFace, BoundingBox } from '../types';

// Helper function to convert a File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the "data:image/...;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * UTILITY FUNCTION: Crops a larger image to a smaller one based on a bounding box.
 * You can use this to generate the required `thumbnailUrl` from the bounding boxes
 * returned by your custom face detection model.
 * @param imageUrl The URL of the source image to crop.
 * @param box The normalized bounding box coordinates.
 * @returns A Promise that resolves to a data URL (base64) of the cropped image.
 */
const cropImage = (imageUrl: string, box: BoundingBox): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageUrl); // fallback
        return;
      }
      
      const sx = box.x * img.width;
      const sy = box.y * img.height;
      const sWidth = box.width * img.width;
      const sHeight = box.height * img.height;

      canvas.width = sWidth;
      canvas.height = sHeight;
      
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = imageUrl;
  });
};


/**
 * Face detection using FaceFusion API
 * Detects faces in an image and returns normalized coordinates and thumbnails
 */
export const detectFacesInImage = async (imageFile: File): Promise<DetectedFace[]> => {
  console.log("Executing face detection using FaceFusion API...");
  
  try {
    // Convert image file to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Create image URL for thumbnail generation
    const imageUrl = URL.createObjectURL(imageFile);
    
    // Create image element to get dimensions for normalization
    const img = new Image();
    const imageDimensions = await new Promise<{width: number, height: number}>((resolve) => {
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = imageUrl;
    });
    
    // Call FaceFusion face detection API
    const apiUrl = process.env.FACEFUSION_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/face_detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
        detector_size: "640x640"
      })
    });

    if (!response.ok) {
      throw new Error(`Face detection API failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Debug: Log the actual API response
    console.log("Face detection API response:", result);
    
    if (result.error) {
      throw new Error(`Face detection error: ${result.error}`);
    }
    
    // If no faces detected, return empty array
    if (result.face_count === 0 || !result.faces) {
      console.log("No faces detected in image");
      return [];
    }

    // Convert API response to DetectedFace format
    const detectedFaces = await Promise.all(
      result.faces.map(async (face: any, index: number) => {
        // Debug: Log each face data
        console.log(`Face ${index}:`, face);
        console.log(`Bounding box:`, face.bounding_box);
        
        // API might return bounding box as [x1, y1, x2, y2] (top-left, bottom-right corners)
        // or [x, y, width, height]. Let's check and handle both cases
        const [coord1, coord2, coord3, coord4] = face.bounding_box;
        
        console.log(`Raw bounding box: [${coord1}, ${coord2}, ${coord3}, ${coord4}]`);
        console.log(`Image dimensions - width: ${imageDimensions.width}, height: ${imageDimensions.height}`);
        
        // Check if this looks like [x1, y1, x2, y2] format
        // If coord3 and coord4 are larger than coord1 and coord2, it's likely [x1, y1, x2, y2]
        let x, y, width, height;
        
        if (coord3 > coord1 && coord4 > coord2) {
          // [x1, y1, x2, y2] format - convert to [x, y, width, height]
          x = coord1;
          y = coord2;
          width = coord3 - coord1;
          height = coord4 - coord2;
          console.log("Detected [x1, y1, x2, y2] format, converted to [x, y, w, h]");
        } else {
          // [x, y, width, height] format
          x = coord1;
          y = coord2;
          width = coord3;
          height = coord4;
          console.log("Detected [x, y, width, height] format");
        }
        
        console.log(`Converted coordinates - x: ${x}, y: ${y}, width: ${width}, height: ${height}`);
        
        // Make the box tighter around the face (reduce padding)
        const padding = 0.15; // 15% padding reduction for better fit
        const tightX = x + (width * padding / 2);
        const tightY = y + (height * padding / 2);
        const tightWidth = width * (1 - padding);
        const tightHeight = height * (1 - padding);
        
        // For object-contain images in square containers, we need to account for 
        // the actual display area vs the container area
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;
        
        let displayScaleX, displayScaleY, offsetX = 0, offsetY = 0;
        
        if (imageAspectRatio > 1) {
          // Wide image: limited by width, centered vertically
          displayScaleX = 1;
          displayScaleY = 1 / imageAspectRatio;
          offsetY = (1 - displayScaleY) / 2;
        } else {
          // Tall image: limited by height, centered horizontally  
          displayScaleX = imageAspectRatio;
          displayScaleY = 1;
          offsetX = (1 - displayScaleX) / 2;
        }
        
        // Apply scaling and offset to coordinates
        const normalizedBox: BoundingBox = {
          x: offsetX + (tightX / imageDimensions.width) * displayScaleX,
          y: offsetY + (tightY / imageDimensions.height) * displayScaleY,
          width: (tightWidth / imageDimensions.width) * displayScaleX,
          height: (tightHeight / imageDimensions.height) * displayScaleY
        };
        
        console.log(`Image aspect ratio: ${imageAspectRatio}`);
        console.log(`Display scale: ${displayScaleX} x ${displayScaleY}, offset: ${offsetX}, ${offsetY}`);
        console.log(`Final normalized box:`, normalizedBox);
        
        // Use the original API index as the ID to maintain consistency
        const id = index.toString(); // '0', '1', '2', ...
        
        // Generate thumbnail using the crop function with original coordinates (not display coordinates)
        const originalBoxForThumbnail: BoundingBox = {
          x: x / imageDimensions.width,
          y: y / imageDimensions.height,
          width: width / imageDimensions.width,
          height: height / imageDimensions.height
        };
        const thumbnailUrl = await cropImage(imageUrl, originalBoxForThumbnail);
        
        return {
          id,
          box: normalizedBox,
          thumbnailUrl
        };
      })
    );

    console.log(`Successfully detected ${detectedFaces.length} faces`);
    return detectedFaces;
    
  } catch (error) {
    console.error('Face detection failed:', error);
    throw new Error(`Face detection failed: ${error.message}`);
  }
};

/**
 * Face swapping using FaceFusion API
 * Swaps faces between source and target images
 */
export const swapFacesInImage = async (
  sourceFile: File,
  targetFile: File,
  sourceFace: DetectedFace,
  targetFace: DetectedFace
): Promise<string> => {
  console.log("Executing face swap using FaceFusion API...", { sourceFace, targetFace });
  
  try {
    // Convert both images to base64
    const sourceBase64 = await fileToBase64(sourceFile);
    const targetBase64 = await fileToBase64(targetFile);

    // Convert face IDs to indices (our IDs are already numeric strings)
    const sourceFaceIndex = parseInt(sourceFace.id);
    const targetFaceIndex = parseInt(targetFace.id);

    console.log(`Using source face index: ${sourceFaceIndex}, target face index: ${targetFaceIndex}`);

    // Call FaceFusion face swap API
    const apiUrl = process.env.FACEFUSION_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/face_swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_image: sourceBase64,
        target_image: targetBase64,
        enhance: true,
        detector_size: "640x640",
        source_face_index: sourceFaceIndex,
        target_face_index: targetFaceIndex,
        face_order: "right-left"
      })
    });

    if (!response.ok) {
      throw new Error(`Face swap API failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Face swap error: ${result.error}`);
    }
    
    if (!result.success || !result.result_image) {
      throw new Error("Face swap failed: No result image returned");
    }

    // Convert base64 result to data URL
    const resultImageDataUrl = `data:image/jpeg;base64,${result.result_image}`;
    
    console.log("Face swap completed successfully");
    console.log(`Source faces: ${result.source_faces_count}, Target faces: ${result.target_faces_count}`);
    
    return resultImageDataUrl;
    
  } catch (error) {
    console.error('Face swap failed:', error);
    throw new Error(`Face swap failed: ${error.message}`);
  }
};
