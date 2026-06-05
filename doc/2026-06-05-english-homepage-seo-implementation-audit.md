# 英文首页 SEO 内容扩充实施计划

## 目标

在不改变英文首页现有搜索流量入口的前提下，围绕 `Polaroid photo generator` 扩充首页可见英文内容，覆盖 What Is、How To、Why 和 FAQ 四类搜索意图，移除社区评论模块，并保证页面描述与当前实际产品能力一致。

## 不可变约束

- 英文页面 Title 保持不变：
  `Polaroid AI Photo Generator - Create Vintage Photos with AI`
- 英文 Meta Description 保持不变：
  `Polaroid AI Photo Generator lets you instantly create retro, vintage-style Polaroid photos with realistic white borders and nostalgic film effects.`
- 英文首页 H1 保持不变：
  `Polaroid AI Generator`
- 不改动生成器业务逻辑、积分逻辑、登录逻辑和 API。
- 不硬编码任何关键环境变量或密钥。
- 不使用隐藏文本、关键词堆砌或仅面向搜索引擎的不可见内容。
- 不宣传当前无法验证或尚未开放的能力。
- 本阶段只优化英文首页内容；中文内容仅补齐组件渲染所必需的翻译键，避免中文页面报错。

## 内容策略

### 搜索意图

- `What Is`：解释 Polaroid photo generator 的定义、效果和适用场景。
- `How To`：解释如何编写提示词、生成、检查和下载结果。
- `Why`：解释相比普通滤镜、实体即时相机和通用图像生成器的价值。
- `FAQ`：回答免费次数、登录、耗时、提示词、下载、上传、隐私和商业使用等真实问题。

### 内容质量标准

- 英文首页可见正文目标为 1,000-1,400 个英文词。
- 主关键词 `Polaroid photo generator` 自然出现约 14-18 次。
- 按完整短语出现次数计算时保持自然；按短语包含的 3 个词折算时，目标密度为约 3.5%-5%。
- 使用 `AI Polaroid generator`、`instant photo generator`、`vintage photo generator` 等语义变体。
- 每个模块优先回答用户问题，不为满足密度机械重复关键词。
- 所有产品声明必须能从当前前端行为、API 或配置中得到验证。

## 文件边界

计划修改：

- `app/[locale]/(marketing)/page.tsx`
  - 保持首页路由和 H1 来源不变。
  - 仅在英文首页启用完整 SEO 内容。
  - 挂载仅首页使用的结构化数据。
- `app/[locale]/(marketing)/mvp-simple/page.tsx`
  - 明确关闭完整 SEO 内容，避免与首页产生重复正文。
- `app/[locale]/(marketing)/mvp-simple.tsx`
  - 从页面装配中移除社区评论模块。
  - 通过显式参数控制首页 SEO 内容，只在英文首页挂载 What Is、How To、Why、Features 和 FAQ。
- `components/seo/homepage-structured-data.tsx`
  - 输出与英文首页可见内容一致的 FAQPage 和 HowTo JSON-LD。
- `components/sections/what-is-section.tsx`
  - 扩充 What Is 可见内容，但保持现有组件职责和视觉语言。
- `components/sections/how-it-works-section.tsx`
  - 将简短步骤扩充为可执行的 How To 内容。
- `components/sections/why-polaroid-generator.tsx`
  - 新增 Why 模块，单独负责价值说明与使用场景。
- `components/sections/polaroid-faq.tsx`
  - 扩充并更新 FAQ，删除无法验证或已经过时的声明。
- `messages/en.json`
  - 写入英文首页正文。
- `messages/zh.json`
  - 仅补齐新增组件所需翻译键，保证中文路由可渲染。
- `scripts/audit-homepage-seo.mjs`
  - 自动校验受保护元数据、H1、正文词数、关键词使用、过时声明和必需模块。

计划不修改：

- `app/[locale]/layout.tsx` 中 Title 与 Meta Description 的来源和现有英文值。
- 生成 API、积分、登录和下载逻辑。
- `components/sections/examples.tsx` 文件本身。首页只停止渲染，避免覆盖现有未提交改动。

## Stage 1: 开发前审计

**Goal**：确认内容约束、真实产品能力、路由影响和当前工作区状态。

**Success Criteria**：

- 已记录受保护 Title、Meta Description 和 H1 的当前值。
- 已确认 `/` 与 `/mvp-simple` 的组件复用影响。
- 已确认可宣传与不可宣传的产品能力。
- 已确认英文和中文翻译 JSON 可解析。
- 已确认相关文件存在未提交改动，并制定不覆盖策略。
- 已建立可重复执行的验证命令。

**Tests**：

- `node` 解析 `messages/en.json` 与 `messages/zh.json`。
- `git diff --check` 检查当前差异。
- `pnpm exec tsc --noEmit` 检查当前类型基线。
- `pnpm run build` 检查当前构建基线。

**Status**：Complete

## Stage 2: 建立自动 SEO 审计

**Goal**：在改正文前建立会失败的审计脚本，保护已有流量入口并约束内容质量。

**Success Criteria**：

- 脚本断言英文 Title、Meta Description 和 H1 完全不变。
- 脚本统计英文首页目标内容的词数和完整关键词短语密度。
- 脚本检查 What Is、How To、Why、FAQ 四个模块。
- 脚本检查社区评论模块不再挂载到首页。
- 脚本检查已知的过时或无法验证声明不会出现在首页目标内容中。

**Tests**：

- 首次运行审计脚本应因缺少 Why、社区评论仍挂载等原因失败。
- 完成实现后再次运行应通过。

**Status**：Complete

## Stage 3: 扩充英文首页内容

**Goal**：以现有组件风格实现完整、自然、真实的英文首页 SEO 内容。

**Success Criteria**：

- What Is、How To、Why、FAQ 均为可见正文。
- 社区评论模块不再显示。
- 英文可见正文达到 1,000-1,400 词。
- 完整主关键词密度保持自然，避免关键词堆砌。
- 不出现当前无法验证的上传、固定生成耗时、固定分辨率、训练数据、满意度或绝对版权承诺。
- 中文首页不会因缺少翻译键而报错。

**Tests**：

- 运行 `node scripts/audit-homepage-seo.mjs`。
- 运行 `pnpm exec tsc --noEmit`。
- 运行 `pnpm run build`。
- 手动检查英文首页桌面端与移动端模块层级、可读性和 CTA。

**Status**：Complete

## Stage 4: 结构化数据与最终验证

**Goal**：让搜索引擎能够理解与页面可见内容一致的 HowTo 和 FAQ 信息，并完成最终质量检查。

**Success Criteria**：

- 结构化数据只描述页面真实可见内容。
- Title、Meta Description 和 H1 与开发前完全一致。
- 无关键环境变量或密钥被硬编码或纳入计划提交文件。
- 无无关格式化、重命名或依赖变更。
- 已记录验证结果和残余风险。

**Tests**：

- 运行 `node scripts/audit-homepage-seo.mjs`。
- 运行 `git diff --check`。
- 运行 `pnpm exec tsc --noEmit`。
- 运行 `pnpm run build`。
- 检查目标文件差异与敏感信息扫描结果。

**Status**：Complete

## 审计闸门

满足以下条件后才允许进入开发：

- 受保护的 Title、Meta Description、H1 已被自动化校验覆盖。
- 已决定 `/mvp-simple` 是否同步显示首页 SEO 内容，避免无意的跨路由改动。
- 已删除或改写所有与实际产品能力冲突的计划文案。
- 当前类型检查和构建基线可用；若基线失败，失败原因必须与本任务隔离并记录。
- 目标文件中的现有用户改动可以被保留，不需要回滚或覆盖。

## 2026-06-05 开发前审计结果

### 已通过

- 英文 Title 当前值与不可变约束一致。
- 英文 Meta Description 当前值与不可变约束一致。
- 英文 H1 当前值与不可变约束一致。
- `messages/en.json` 与 `messages/zh.json` 均可被 JSON 解析。
- `pnpm exec tsc --noEmit` 通过。
- `pnpm run build` 通过，英文首页为可预渲染页面。
- `git diff --check` 未发现空白错误。
- 目标文件未发现疑似 API Key、Token、数据库连接串或私钥。
- 相关首页文件虽然已有未提交改动，但可以通过局部补丁保留，不需要回滚。

### 当前问题

- 生产构建后的英文首页实际可见正文约 623 词，未达到 1,000 词目标。
- 精确短语 `Polaroid photo generator` 当前出现 0 次。
- 社区评论模块当前仍在首页显示。
- 当前没有独立 Why 模块，也没有 FAQPage 或 HowTo JSON-LD。
- `/` 与 `/mvp-simple` 当前渲染同一组件和同一套正文，存在重复内容风险。
- 当前首页可见内容包含与实现不一致或无法验证的声明：
  - 宣称 100 个免费测试积分，但实现为游客 2 次免费生成。
  - 宣称文字生成消耗 5 积分、图片转换消耗 8 积分，但当前文字生成实际消耗 3 积分，图片合成功能尚未开放。
  - 宣称支持上传图片，但当前 API 对非文字输入返回 `Image composition is coming soon.`。
  - 宣称固定 10-15 秒生成、1080×1080 输出、基于数千张照片训练、满意度超过 90%、完整商业使用权，当前代码无法证明这些承诺。

### 非阻断问题

- 生产构建存在大量既有 Tailwind 类名顺序和 `<img>` 性能警告。
- `app/[locale]/layout.tsx` 当前为多个营销路由输出首页 canonical；本任务只隔离首页正文，不扩大修改 canonical 策略。

### 审计结论

审计通过，可以进入开发。开发必须遵守以下处理决定：

- 完整 SEO 正文只在英文首页显示。
- `/mvp-simple` 保留生成器，不显示社区评论或整套首页 SEO 正文。
- 新正文必须纠正上述不一致声明。
- Title、Meta Description 和 H1 必须由自动审计脚本精确保护。

## 实施结果

- 英文首页实际生产 HTML 可读正文：1087 个英文词。
- 精确短语 `Polaroid photo generator`：17 次。
- 按三词短语折算的实际页面关键词密度：4.69%。
- Title、Meta Description、H1：与开发前完全一致。
- 英文首页模块：What Is、How To、Why、Features、FAQ。
- 社区评论模块：已从页面装配中移除。
- `/mvp-simple`：已隔离为仅生成器页面，不再重复首页 SEO 正文。
- 结构化数据：英文首页输出 FAQPage 与 HowTo JSON-LD。
- 已纠正首页可见正文中的积分、免费次数、图片上传、固定耗时、固定分辨率、训练数据、满意度和绝对商业版权声明。

## 验证结果

- `node scripts/audit-homepage-seo.mjs`：通过。
- `pnpm exec tsc --noEmit`：通过。
- `pnpm run build`：通过；构建期间存在既有 lint 警告与一个已被页面逻辑容错的数据库连接提示。
- `pnpm exec prettier --check ...`：任务文件通过。
- `git diff --check`：通过。
- 英文与中文翻译 JSON：可解析。
- 任务文件敏感信息扫描：未发现疑似密钥。
- 生产服务器 HTML 检查：通过。

## 残余风险

- 当前 Windows 沙箱无法启动 in-app Browser 插件，因此未完成截图级视觉检查。
- 构建仍报告项目既有 Tailwind 类名顺序、`<img>` 性能等警告，本任务未进行无关清理。
- 全站 canonical 策略仍由 `app/[locale]/layout.tsx` 统一输出，本任务未扩大范围修改。

## 风险与处理

- **关键词堆砌风险**：不执行 3.5%-5% 的完整短语密度目标，改用约 1%-2% 的自然完整短语密度和语义变体。
- **流量波动风险**：Title、Meta Description、H1 使用精确字符串保护，不做任何修改。
- **跨路由影响风险**：`/` 与 `/mvp-simple` 当前复用同一组件，开发前必须确定是否隔离 SEO 内容。
- **虚假声明风险**：以当前实现为事实来源，无法验证的声明不进入新正文。
- **工作区覆盖风险**：相关首页组件已有未提交改动，只做局部补丁，不回滚、不整体重写。
- **重复内容风险**：若 `/mvp-simple` 同步显示完整 SEO 内容，需要确认 canonical 策略；优先让完整 SEO 内容只属于首页。
