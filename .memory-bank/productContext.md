# 产品背景与目标

## 产品背景

"字幕学单词"最初是一个基于 WPF 的 Windows 应用程序，目的是帮助用户通过观看影视内容的同时学习英语词汇。原应用提供了字幕解析、词典查询、视频同步等功能，但受限于技术栈仅支持 Windows 平台。

## 现代化需求

随着跨平台需求的增加和技术栈的发展，需要对应用进行现代化重写，主要解决以下问题：

1. **跨平台支持**: 扩展到 macOS 和 Linux 平台
2. **UI/UX 改进**: 提供现代化、易用的界面
3. **技术债务**: 更新到现代技术栈，提高维护性
4. **扩展性**: 建立更灵活的架构，便于未来功能扩展

## 目标用户

- 英语学习者，特别是通过影视内容学习英语的人群
- 需要扩充词汇量的语言学习者
- 希望通过字幕内容进行单词记忆和学习的用户

## 核心功能需求

1. **字幕解析**:

   - 支持 SRT 和 ASS 格式字幕
   - 准确提取英语单词
   - 保留单词在视频中的时间信息

2. **词典系统**:

   - 内置本地词典
   - 支持在线词典查询
   - 提供单词释义、发音和例句

3. **视频学习**:

   - 支持视频同步播放
   - 单词与视频时间点对应
   - 提供单词发音功能

4. **学习管理**:
   - 记录已知单词
   - 标记拼写错误
   - 跟踪学习进度

## 产品价值主张

### 核心价值

- **沉浸式学习体验**: 结合影视娱乐和语言学习，提高学习效率和兴趣
- **精准词汇提取**: 从字幕中智能提取有价值的学习词汇
- **个性化学习路径**: 根据用户水平和学习进度定制学习内容
- **跨平台一致性**: 在不同操作系统上提供一致的学习体验

### 竞争优势

- **技术现代化**: 基于 Electron + React 的现代架构
- **开源友好**: 代码开放，社区可贡献和扩展
- **高度定制**: 灵活的配置和扩展机制
- **性能优化**: 高效的字幕解析和词典查询

## 用户场景与用户故事

### 典型用户画像

**小李 - 大学英语学习者**

- 年龄：20 岁，大学二年级学生
- 需求：通过观看英文电影提高英语听力和词汇量
- 痛点：遇到生词需要暂停查词典，影响观影体验
- 期望：能在观影过程中快速了解生词含义，并记录学习进度

**王女士 - 职场英语提升者**

- 年龄：28 岁，外企员工
- 需求：利用业余时间通过美剧学习商务英语
- 痛点：时间有限，希望高效学习职场常用词汇
- 期望：能快速识别和学习字幕中的职场词汇

### 核心用户故事

1. **作为英语学习者，我希望能选择字幕文件进行解析，以便快速了解其中包含的词汇**

   - 验收标准：能够选择 SRT/ASS 文件并成功解析
   - 验收标准：显示字幕条目和提取的单词列表
   - 验收标准：提供词频统计信息

2. **作为学习者，我希望能点击单词查看释义，以便理解单词含义**

   - 验收标准：点击单词能触发查词功能
   - 验收标准：显示单词的音标、释义、翻译和例句
   - 验收标准：查词结果加载迅速（<500ms）

3. **作为学习者，我希望能标记已知单词，以便专注学习生词**

   - 验收标准：能够标记单词为"已知"状态
   - 验收标准：已知单词在界面上有视觉区分
   - 验收标准：标记状态能够持久保存

4. **作为学习者，我希望能跟踪学习进度，以便了解学习效果**
   - 验收标准：显示总词汇量、已学词汇数量
   - 验收标准：提供学习统计图表
   - 验收标准：支持学习历史记录查看

## 技术实现目标

### 可用性目标

- **响应时间**: 字幕解析 < 2 秒，词典查询 < 500ms
- **稳定性**: 应用崩溃率 < 0.1%，数据丢失率 = 0%
- **兼容性**: 支持 Windows/macOS/Linux 三大平台
- **文件支持**: 支持常见字幕格式（SRT、ASS、VTT）

### 用户体验目标

- **学习效率**: 相比传统查词典方式提升 50% 学习效率
- **操作简便**: 新用户 5 分钟内能够完成基本操作
- **界面友好**: 现代化、简洁的界面设计
- **功能完整**: 覆盖从字幕导入到学习记录的完整流程

## 产品路线图

### 第一阶段：MVP 核心功能 ✅ 已完成

- [x] 字幕文件选择和解析 (SRT/ASS 格式)
- [x] 智能单词提取和词频统计
- [x] 在线词典查询功能 (Free Dictionary API)
- [x] 现代化用户界面 (VS Code 风格)
- [x] 实时搜索和过滤功能
- [x] 完整的错误处理和用户反馈

### 第二阶段：视频学习功能（下一阶段）

- [ ] HTML5 视频播放器集成
- [ ] 视频与字幕时间同步
- [ ] 单词点击跳转视频时间点
- [ ] 视频播放控制和进度显示

### 第三阶段：学习管理系统（计划中）

- [ ] 学习记录和进度跟踪
- [ ] 单词标记和分类 (已知/困难/收藏)
- [ ] 学习统计和数据可视化
- [ ] 复习提醒和智能推荐

### 第四阶段：高级特性（未来规划）

- [ ] 单词发音功能 (TTS)
- [ ] 学习数据导出和备份
- [ ] 多主题和界面定制
- [ ] 键盘快捷键和效率工具

### 第五阶段：生态扩展（长期规划）

- [ ] 跨平台打包和分发
- [ ] 自动更新机制
- [ ] 插件系统和扩展支持
- [ ] 社区功能和数据同步

## 成功指标

### 技术指标

- **代码质量**: TypeScript 零错误，ESLint 零警告
- **测试覆盖率**: 目标 80% 以上
- **构建成功率**: 100%
- **平台兼容性**: 三大平台正常运行

### 产品指标

- **用户留存**: 第一周留存率 > 60%
- **功能使用**: 核心功能使用率 > 80%
- **性能表现**: 用户反馈的性能问题 < 5%
- **用户满意度**: 用户评价 4.0+ (满分 5.0)

## 竞品分析

### 市场现状

- **Language Learning with Netflix**: 仅支持在线流媒体
- **FluentU**: 付费服务，内容有限
- **Anki**: 通用记忆卡片，缺乏视频同步
- **本项目优势**: 离线使用、跨平台、开源、自定义字幕

### 差异化定位

- **专注字幕学习**: 深度优化字幕解析和词汇提取
- **技术现代化**: 采用最新技术栈，性能和体验俱佳
- **开源生态**: 社区驱动的功能扩展和改进
- **本地优先**: 保护用户隐私，支持离线使用

# Product Context

## 1. Problem Space

Language learners often immerse themselves in native media like movies and TV shows to improve their skills. However, the process of understanding and learning new vocabulary from this content is often cumbersome. It typically involves:

1.  Pausing the video.
2.  Manually looking up the unfamiliar word in a separate dictionary or translator app.
3.  Writing down the word and its meaning.
4.  Resuming the video.

This constant context-switching is disruptive, breaks the flow of viewing, and makes vocabulary acquisition inefficient.

## 2. How It Should Work (User Experience)

"Words Via Subtitle" aims to create a seamless and integrated learning experience. The ideal user journey is as follows:

1.  **Open**: The user opens the application and is greeted with a clean interface to select a local video file.
2.  **Load**: The user selects a video file and a corresponding subtitle file (`.srt`, `.ass`, etc.).
3.  **Watch**: The video plays with the subtitles displayed overlaying the video or in a dedicated panel below.
4.  **Interact**: When the user encounters an unknown word in the subtitles, they simply click on it.
5.  **Learn**: A pop-up or a side panel instantly displays the definition, translation, and pronunciation of the clicked word, without interrupting video playback (playback can be configured to pause automatically).
6.  **Save**: The user can save the word to a personal vocabulary list with a single click.
7.  **Review**: At any time, the user can access their vocabulary lists, which are organized by the video they came from, and review the words they have saved.

## 3. User Experience Goals

- **Frictionless**: Minimize the effort required to look up and save a new word.
- **Contextual**: Keep the learning process within the context of the video content.
- **Non-disruptive**: Allow for an uninterrupted viewing experience.
- **Modern & Intuitive**: Provide a visually appealing and easy-to-navigate user interface that feels at home on a modern desktop operating system.
