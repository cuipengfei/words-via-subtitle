// notarize.js
/**
 * macOS 公证脚本
 * 在打包签名后执行，用于 macOS 应用公证
 */

const { notarize } = require('@electron/notarize');
const path = require('path');

module.exports = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // 仅在macOS平台执行公证
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // 检查环境变量是否配置（CI环境使用）
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn('跳过公证：未找到Apple ID凭据');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`正在公证应用：${appPath}`);

  try {
    await notarize({
      appBundleId: 'com.electron.words-via-subtitle',
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      ascProvider: process.env.APPLE_TEAM_ID,
    });

    console.log('应用公证完成');
  } catch (error) {
    console.error('应用公证失败:', error);
    throw error;
  }
};
