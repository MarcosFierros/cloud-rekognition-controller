require('dotenv').config()

const express = require('express')
const app = express();
const AWS = require('aws-sdk')

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACESS_KEY, 
  AWS_SESSION_TOKEN,
  AWS_REGION_VALUE,
  S3_BUCKETNAME,
  REK_FACE_COLLECTION
} = process.env

if(!AWS_ACCESS_KEY_ID || !AWS_REGION_VALUE || !AWS_SECRET_ACESS_KEY || !AWS_SESSION_TOKEN)
    throw new Error('Missing aws enviroment vars')

const client = new AWS.Rekognition({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACESS_KEY,
  sessionToken: AWS_SESSION_TOKEN,
  region: AWS_REGION_VALUE
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Api using AWS Rekognition!')
});

app.listen(8080, async() => {
  console.log('Example app listening on port 8080!')
});

// Compare S3 Object to a Rekognition Collection
app.get('/compare-faces', (req, res) => {
  const input = {
    "CollectionId": `${REK_FACE_COLLECTION}`,
    "FaceMatchThreshold": 95,
    "Image": {
      "S3Object": {
          "Bucket": `${S3_BUCKETNAME}`,
          "Name": req.get("image")
      }
    }
  }
  client.searchFacesByImage(input, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).send(err);
    }
    console.log(data);
    res.status(200).send(data);
  });
});

// Create Rekognition Colleciton
app.post('/create-collection', (req, res) => {
  const input = {
    "CollectionId": `${REK_FACE_COLLECTION}`
  };
  client.createCollection(input, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).send(err);
    }
    console.log(data);
    res.status(200).send(data);
  });
})

// Add face to Rekognition Collection
app.post('/index-faces', (req, res) => {
  const input = {
    "CollectionId": `${REK_FACE_COLLECTION}`,
    "MaxFaces": 1,
    "DetectionAttributes": [],
    "ExternalImageId": req.body.ExternalID,
    "Image": {
      "S3Object": {
          "Bucket": `${S3_BUCKETNAME}`,
          "Name": req.body.image
      }
    }
  }
  client.indexFaces(input, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).send(err);
    }
    console.log(data);
    res.status(200).send(data);
  });
})

// Delete from Rekognition Colleciton
app.delete('/delete-faces', (req, res) => {
  const input = {
    "CollectionId": `${REK_FACE_COLLECTION}`,
    "FaceIds" : [
      req.body.FaceIds
    ]
  }
  client.deleteFaces(input, (err, data) => {
    if (err) {
      console.log(err)
      res.status(500).send(err);
    }
    console.log(data);
    res.status(200).send(data);
  });
})



