require("dotenv").config();
const express = require("express");
const AWS = require("aws-sdk");

const app = express();
const port = 8080;

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET,
  region: process.env.REGION,
});

const listObjects = async (bucketName) => {
  try {
    const params = {
      Bucket: bucketName,
    };

    const data = await s3.listObjectsV2(params).promise();
    return data.Contents; 
  } catch (error) {
    console.error("Error listing objects:", error);
    throw error;
  }
};

const getPresignedUrl = (bucketName, key, expires = 60) => {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: expires, 
  };

  return s3.getSignedUrl("getObject", params);
};

const generateLinksForObjects = (bucketName, objects) => {
  return objects.map((obj) => ({
    key: obj.Key,
    url: getPresignedUrl(bucketName, obj.Key),
    lastModified: obj.LastModified,
  }));
};


app.get("/s3-data", async (req, res) => {
  try {
    const bucketName = process.env.BUCKET;
    const objects = await listObjects(bucketName);
    const links = generateLinksForObjects(bucketName, objects);

    res.json(links);
  } catch (error) {
    console.error("Error accessing S3 data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

