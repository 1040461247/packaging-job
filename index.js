const path = require('path')
const fs = require('fs')
const compressing = require('compressing')

const workDir = process.argv[2]
const compressExts = ['.zip', '.gzip', '.rar', '.tar']
let compressCount = 0
let uncompressCount = 0
const uncomPromises = []

if (!workDir) {
  console.log('请输入工作目录！')
  return
}

fs.readdir(workDir, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  files.forEach(item => {
    const compressExt = path.extname(item)
    const isCompress = compressExts.includes( compressExt )
    
    if ( isCompress ) {
      compressCount++
      const compressPath = path.resolve(workDir, item)
      const uncompressPath = path.resolve(workDir, item.replace(compressExt, ''))

      uncompressDir(compressExt, compressPath, uncompressPath)
    }
  })

  Promise.all(uncomPromises).then(res => {
    // 打包作业文件夹
    const date = new Date()
    const year = date.getFullYear()
    const month = String( date.getMonth() + 1 ).padStart(2, '0')
    const day = String( date.getDate() ).padStart(2, '0')
    const dirName = `${year}${month}${day}_计科一班作业收集.zip`
    const targetPath = path.resolve(workDir, `../${dirName}`)

    compressing.zip.compressDir( workDir, targetPath )

    console.log(`共有压缩文件${compressCount}份， 成功解压${uncompressCount}份。`)
    console.log(`文件已打包到指定目录， path：${targetPath}`)
  })

})

// 解压文件
function uncompressDir(ext, compressPath, unCompressPath) {
  // TODO
  if (ext === '.rar') {
    console.log('累了，暂时不解压rar了')
    return
  }

  // 创建解压文件夹
  if ( !fs.existsSync(unCompressPath) ) {
    fs.mkdir(unCompressPath, err => {
      if (err) {
        console.log(err)
        return
      }
    })
  }

  uncomPromises.push(
    new Promise((resolve) => {
      compressing[ext.replace('.', '')]
        .uncompress(compressPath, unCompressPath, { zipFileNameEncoding: 'gbk' })
        .then(() => {
          // 删除源压缩文件
          fs.rm(compressPath, err => {
            if (err) {
              console.log(err)
              return
            }
            uncompressCount++
            console.log(compressPath)
            resolve(compressPath)
          })
        })
    })
  )
}
