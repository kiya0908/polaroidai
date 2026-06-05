# 中文首页 SEO 内容实施与审计

## 目标

在不修改现有中文 Title、Meta Description 和 H1 的前提下，为中文首页补齐与英文首页对应的 What Is、How To、Why、Features 和 FAQ 内容，移除社区评论模块，并确保文案与当前产品能力一致。

## 不可变约束

- 中文 Title 保持不变：`宝丽来AI照片生成器 - 用AI创建复古照片`
- 中文 Meta Description 保持不变：`使用AI将您的回忆转化为真实的复古宝丽来照片。从文字描述创建怀旧即时照片，或将您的图片转换为具有白边框和复古效果的经典宝丽来风格。`
- 中文 H1 保持不变：`宝丽来AI生成器`
- 不修改生成器、积分、登录、下载或 API 业务逻辑。
- 不在源代码或文档中写入关键环境变量或密钥。
- 不使用隐藏文本或机械关键词堆砌。

## Stage 1：扩展中文审计

**Goal**：让自动化审计覆盖中文首页，而不只检查英文首页。

**Success Criteria**：

- 精确保护中文 Title、Meta Description 和 H1。
- 要求中文首页包含 What Is、How To、Why、Features 和 FAQ。
- 检查中文正文长度与主关键词自然覆盖。
- 禁止无法证实的固定生成时间、固定分辨率、训练数据、满意度、图片上传和绝对商用权承诺。
- 要求 Why 与结构化数据面向所有首页语言输出。

**Tests**：

- 首次运行 `node scripts/audit-homepage-seo.mjs` 因缺少中文 `IndexPage.why` 失败。
- 实施完成后再次运行审计并通过。

**Status**：Complete

## Stage 2：修改中文首页内容

**Goal**：让中文首页完整覆盖用户的核心搜索意图，同时保持文案真实、自然、可读。

**Success Criteria**：

- What Is 解释工具定义、即时照片视觉特征与能力边界。
- How To 提供从提示词、生成、检查到下载或迭代的四步流程。
- Why 解释概念探索、低门槛试验、提示词学习和前期创作用途。
- Features 说明文字生成、视觉方向、创作主题、积分规则、下载和迭代方式。
- FAQ 回答工作方式、免费次数与积分、处理时间、图片上传、提示词和结果使用。
- 页面不再宣传当前未开放的图片转换能力、固定耗时、固定分辨率或绝对权利。

**Status**：Complete

## Stage 3：结构化数据与页面验证

**Goal**：确认搜索引擎实际获得的生产 HTML 与中文正文一致。

**Success Criteria**：

- 中文首页输出 FAQPage 与 HowTo JSON-LD。
- 中文首页显示 What Is、How To、Why、Features 和 FAQ。
- 社区评论模块不出现在中文或英文首页。
- `/mvp-simple` 继续只显示生成器，避免重复正文。
- 英文首页原有 SEO 指标不回退。

**Status**：Complete

## 审计结果

- 自动化目标内容：中文正文 2614 个非空字符，`宝丽来照片生成器` 出现 17 次。
- 生产 HTML：中文首页实际输出 2009 个汉字，`宝丽来照片生成器` 出现 17 次。
- 中文目标模块：What Is、How To、Why、Features、FAQ 全部存在。
- 中文结构化数据：单个 JSON-LD 脚本中包含 FAQPage 与 HowTo。
- 社区评论模块：中文与英文首页均未输出。
- 已知不实承诺：生产 HTML 中未发现 100 免费测试积分、固定 10-15 秒、1080x1080、90% 满意度或绝对使用权等声明。
- 英文回归：生产 HTML 仍为 1087 个英文词，`Polaroid photo generator` 出现 17 次。
- 受保护元数据与 H1：中英文均保持不变。

## 验证结果

- `node scripts/audit-homepage-seo.mjs`：通过。
- `pnpm exec tsc --noEmit`：通过。
- `pnpm exec prettier --check ...`：通过。
- `pnpm run build`：通过。
- `messages/zh.json` JSON 解析：通过。
- 生产服务器 HTML 检查：通过。
- 构建仍报告项目既有 Tailwind、`img` 和外部数据库连接提示，但未导致构建失败。

## 遗留风险

- 中文 Meta Description 受“不修改”约束保护，但其中仍写有“将您的图片转换”，与当前图片合成功能尚未开放的事实冲突。这会造成搜索结果承诺与落地页能力不一致，应在允许调整受保护元数据时优先修正。
- 中文 SEO 不应机械套用英文单词密度。中文分词边界不稳定，本次使用模块完整性、实际可见汉字数、自然关键词覆盖和事实准确性进行审计。
- 当前 Windows 沙箱无法启动 in-app Browser，因此未完成截图级视觉检查；生产 HTML、类型检查和构建均已验证。
