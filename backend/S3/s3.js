const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const uploadImageToS3 = async (file) => {
  const s3 = new S3Client({
    region: process.env.REGION,
    credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.SECRET_KEY,
    },
  });

  console.log(file);

  const params = {
    Bucket: "example-aws-bucket-trial-for-farmerplace",
    Key: `EasyShop/${file.name}`,
    Body: file.data,
    ContentType: file.mimetype,
  };

  try {
    const uploadResponse = await s3.send(new PutObjectCommand(params));
    const imageURL = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    console.log(
      `Image URL: https://${params.Bucket}.s3.amazonaws.com/${params.Key}`
    );
    return imageURL;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

module.exports = { uploadImageToS3 };