const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const crypto = require('crypto')

// Path to the photos directory containing all the folders to process
const photosDir = path.join(__dirname, 'src/content/photos')

// Get all directories within the photos directory
const baseDirs = fs
  .readdirSync(photosDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name)

console.log(`Found directories to process: ${baseDirs.join(', ')}`)

// Configure Sharp for best quality
sharp.cache(false) // Disable caching for maximum quality processing

// Function to generate a random hash
function generateRandomHash() {
  return crypto.randomBytes(8).toString('hex')
}

// Process each directory
baseDirs.forEach((baseDir) => {
  // Path to the source images directory
  const inputDir = path.join(
    __dirname,
    'src/assets/images',
    `${baseDir}-source`,
  )

  // Skip if source directory doesn't exist
  if (!fs.existsSync(inputDir)) {
    console.log(`Skipping ${baseDir} - source directory not found: ${inputDir}`)
    return
  }

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'src/assets/images', baseDir)

  // Clear the output directory if it exists
  if (fs.existsSync(outputDir)) {
    console.log(`Clearing existing output directory: ${outputDir}`)
    fs.readdirSync(outputDir).forEach((file) => {
      const filePath = path.join(outputDir, file)
      fs.unlinkSync(filePath)
    })
  } else {
    // Create output directory if it doesn't exist
    fs.mkdirSync(outputDir, { recursive: true })
  }

  console.log(`Processing directory: ${baseDir}`)

  // Get all files from the input directory
  fs.readdir(inputDir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${baseDir}:`, err)
      return
    }

    // Process each file
    let processedCount = 0
    const totalFiles = files.filter(
      (file) => file !== '.DS_Store' && file.match(/\.(jpg|jpeg|JPG|JPEG)$/i),
    ).length

    if (totalFiles === 0) {
      console.log(`No JPEG images found in ${baseDir}`)
      return
    }

    // Keep track of generated hashes to avoid duplicates
    const generatedHashes = new Set()

    files.forEach((file) => {
      const inputPath = path.join(inputDir, file)

      // Skip non-image files and .DS_Store
      if (file === '.DS_Store' || !file.match(/\.(jpg|jpeg|JPG|JPEG)$/i)) {
        console.log(`Skipping ${file} - not a JPEG image`)
        return
      }

      // Get file extension while preserving case
      const extension = path.extname(file)

      // Generate unique hash for filename
      let randomHash
      do {
        randomHash = generateRandomHash()
      } while (generatedHashes.has(randomHash))

      // Add hash to tracking set
      generatedHashes.add(randomHash)

      const outputPath = path.join(outputDir, `${randomHash}${extension}`)

      // Enhanced resizing with maximum quality preservation
      sharp(inputPath, { failOnError: false })
        .rotate() // Auto-rotate based on EXIF orientation
        .resize({
          height: 900,
          fit: sharp.fit.contain,
          withoutEnlargement: true, // Don't enlarge if image height < 900
          kernel: sharp.kernel.lanczos3, // Use high-quality Lanczos resampling
        })
        .jpeg({
          quality: 92,
          progressive: true,
          mozjpeg: true,
          trellisQuantisation: true,
          overshootDeringing: true,
          optimizeScans: true,
          quantisationTable: 3,
        })
        .toFile(outputPath)
        .then(() => {
          processedCount++
          console.log(
            `[${baseDir}] Resized ${file} to ${randomHash}${extension} (${processedCount}/${totalFiles})`,
          )
        })
        .catch((err) => {
          console.error(`[${baseDir}] Error resizing ${file}:`, err)
        })
    })
  })
})

console.log('Processing all image directories...')
