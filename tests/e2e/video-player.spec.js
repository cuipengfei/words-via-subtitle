const { test, expect } = require('@playwright/test');

// 视频播放器测试
test('应该能够正确加载和播放视频', async ({ page }) => {
  // 1. 导航到应用页面
  await page.goto('http://localhost:3000');

  // 2. 等待应用加载
  await page.waitForSelector('button:has-text("选择字幕文件")');

  // 3. 上传字幕文件
  // 注意：由于这是Electron应用，文件选择对话框需要特殊处理

  // 4. 上传视频文件
  // 使用类似的特殊处理

  // 5. 验证视频播放器已加载
  await page.waitForSelector('video');

  // 6. 测试播放控制
  const playButton = await page.locator('button[aria-label="播放"]');
  await playButton.click();

  // 7. 验证视频正在播放
  const isPlaying = await page.evaluate(() => {
    const video = document.querySelector('video');
    return !video.paused;
  });
  expect(isPlaying).toBeTruthy();

  // 8. 测试暂停功能
  await playButton.click();
  const isPaused = await page.evaluate(() => {
    const video = document.querySelector('video');
    return video.paused;
  });
  expect(isPaused).toBeTruthy();

  // 9. 测试播放速度控制
  const speedControl = await page.locator('select[aria-label="播放速度"]');
  await speedControl.selectOption('1.5');

  const playbackRate = await page.evaluate(() => {
    const video = document.querySelector('video');
    return video.playbackRate;
  });
  expect(playbackRate).toBe(1.5);

  // 10. 测试字幕显示
  await page.waitForSelector('.subtitle-text');

  // 11. 测试字幕单词点击
  await page.locator('.subtitle-text span').first().click();

  // 12. 验证词典查询已触发
  await page.waitForSelector('.word-definition');
});
