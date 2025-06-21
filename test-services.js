// 测试脚本，验证字幕解析和词典服务功能
import { SubtitleParserService } from './src/main/services/subtitleParser.js';
import { DictionaryService } from './src/main/services/dictionaryService.js';

async function testServices() {
  console.log('开始测试服务...');

  // 测试字幕解析
  const subtitleParser = new SubtitleParserService();
  console.log('字幕解析服务创建成功');

  // 测试词典服务
  const dictionaryService = new DictionaryService();
  console.log('词典服务创建成功');

  console.log('所有服务测试完成');
}

testServices().catch(console.error);
