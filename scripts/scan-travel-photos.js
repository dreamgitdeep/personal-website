/**
 * 自动扫描图片文件夹并更新配置文件
 * 使用方法：在项目根目录运行 node scripts/scan-travel-photos.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  imageDir: path.join(__dirname, '../images/hobbies/travel'),
  outputFile: path.join(__dirname, '../data/travel-photos.json'),
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
};

/**
 * 扫描目录并获取所有图片文件
 */
function scanImageDirectory() {
  console.log('🔍 开始扫描图片目录:', CONFIG.imageDir);
  
  const files = fs.readdirSync(CONFIG.imageDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return CONFIG.supportedExtensions.includes(ext);
  });
  
  console.log(`📁 找到 ${imageFiles.length} 个图片文件`);
  
  // 按文件名排序
  imageFiles.sort();
  
  return imageFiles;
}

/**
 * 读取现有配置，保留备注信息
 */
function loadExistingConfig() {
  try {
    if (fs.existsSync(CONFIG.outputFile)) {
      const data = fs.readFileSync(CONFIG.outputFile, 'utf8');
      const config = JSON.parse(data);
      console.log('✅ 已加载现有配置文件');
      
      // 创建文件名到备注的映射
      const captionMap = {};
      config.photos.forEach(photo => {
        captionMap[photo.file] = photo.caption;
      });
      
      return captionMap;
    }
  } catch (error) {
    console.log('⚠️ 无法加载现有配置，将创建新配置');
  }
  
  return {};
}

/**
 * 生成新的配置文件
 */
function generateConfig(imageFiles, existingCaptions) {
  const photos = imageFiles.map((file, index) => ({
    id: index + 1,
    file: file,
    caption: existingCaptions[file] || '',
    order: index + 1
  }));
  
  const config = {
    photos: photos,
    lastUpdated: new Date().toISOString().split('T')[0],
    totalPhotos: photos.length
  };
  
  return config;
}

/**
 * 保存配置文件
 */
function saveConfig(config) {
  const dir = path.dirname(CONFIG.outputFile);
  
  // 确保目录存在
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(
    CONFIG.outputFile,
    JSON.stringify(config, null, 2),
    'utf8'
  );
  
  console.log('✅ 配置文件已保存到:', CONFIG.outputFile);
}

/**
 * 主函数
 */
function main() {
  console.log('========================================');
  console.log('📸 旅游照片扫描工具');
  console.log('========================================\n');
  
  try {
    // 检查图片目录是否存在
    if (!fs.existsSync(CONFIG.imageDir)) {
      console.error('❌ 图片目录不存在:', CONFIG.imageDir);
      process.exit(1);
    }
    
    // 扫描图片
    const imageFiles = scanImageDirectory();
    
    if (imageFiles.length === 0) {
      console.log('⚠️ 未找到任何图片文件');
      console.log('支持的格式:', CONFIG.supportedExtensions.join(', '));
      process.exit(0);
    }
    
    // 加载现有配置
    const existingCaptions = loadExistingConfig();
    
    // 生成新配置
    const config = generateConfig(imageFiles, existingCaptions);
    
    // 保存配置
    saveConfig(config);
    
    console.log('\n========================================');
    console.log(`✨ 完成！共处理 ${config.totalPhotos} 张照片`);
    console.log('========================================\n');
    
  } catch (error) {
    console.error('❌ 发生错误:', error.message);
    process.exit(1);
  }
}

// 运行
main();
