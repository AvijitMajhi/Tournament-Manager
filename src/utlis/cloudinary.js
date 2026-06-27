import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error('Local file path is required');
            return null;
        }

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });
        console.log('File uploaded to Cloudinary:', result.url);
        // Delete the local file after successful upload
        fs.unlinkSync(localFilePath);

        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file even if upload fails
        console.error('Error uploading to Cloudinary:', error);
        return null;
    }
};
export {uploadOnCloudinary};