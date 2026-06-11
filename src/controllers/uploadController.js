const multer = require('multer')
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const s3Client = require('../config/aws')


const storage = multer.memoryStorage()


const fileFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only images allowed'), false)
  }
}


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
})

exports.uploadSingle = upload.single('cover')

exports.uploadCover = async (req, res) => {
    try {
    
        if(!req.file) {
            return res.status(400).json({
              error: 'Does not get the right file'
            })
          }
        
        const fileName = Date.now() + '-' + req.file.originalname

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
          })
          await s3Client.send(command)
          const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        
        res.status(200).json({
            success: true,
            data: {
                url: url
            }
          })
  
    } catch(error) {
      res.status(500).json({ error: error.message })
    }
  }