import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

const COZE_API_URL = "https://api.coze.cn/v1/workflow/run"
const COZE_TOKEN = "pat_ozOtLC18gpVsqCKfihyNPOTmd2nPDJEEiwNgZQS82IQXRVbh58Jk9oHEcm794mBl"
const WORKFLOW_ID = "7518398236290940962"

// 5分钟超时
const TIMEOUT_MS = 5 * 60 * 1000

// 支持的主流平台及正文选择器
const PLATFORM_SELECTORS = [
  {
    name: "微信公众号",
    test: (url: string) => /mp\.weixin\.qq\.com\//.test(url),
    selector: "#js_content",
  },
  {
    name: "知乎专栏",
    test: (url: string) => /zhuanlan\.zhihu\.com\//.test(url),
    selector: ".Post-RichTextContainer, .RichText ztext",
  },
  {
    name: "百度百家号",
    test: (url: string) => /baijiahao\.baidu\.com\//.test(url),
    selector: ".article-content, .article-title, .index-module_articleContent_2jMn7",
  },
  {
    name: "CSDN博客",
    test: (url: string) => /csdn\.net\//.test(url),
    selector: "#article_content, .blog-content-box",
  },
  {
    name: "简书",
    test: (url: string) => /jianshu\.com\//.test(url),
    selector: ".article, .show-content",
  },
  {
    name: "今日头条",
    test: (url: string) => /toutiao\.com\//.test(url),
    selector: ".article-content, .article-title",
  },
  // ... 可继续扩展
]

async function fetchArticleContent(url: string): Promise<string | null> {
  const platform = PLATFORM_SELECTORS.find(p => p.test(url))
  if (!platform) return null
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
    const html = await res.text()
    const $ = cheerio.load(html)
    let content = $(platform.selector).text().trim()
    if (!content) {
      // 尝试获取所有段落文本
      content = $("p").map((_: number, el: any) => $(el).text()).get().join("\n").trim()
    }
    return content.length > 50 ? content : null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "请提供有效的文章链接" }, { status: 400 })
    }

    // 验证URL格式
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "请提供有效的URL格式" }, { status: 400 })
    }

    // 创建超时控制器
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    // 新增：尝试自动抓取正文
    let articleContent: string | null = null
    articleContent = await fetchArticleContent(url)

    try {
      const response = await fetch(COZE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COZE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflow_id: WORKFLOW_ID,
          parameters: {
            BOT_USER_INPUT: articleContent || "",
            article_url: url,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Coze API Error:", response.status, errorText)

        if (response.status === 401) {
          return NextResponse.json({ error: "API认证失败，请检查令牌配置" }, { status: 500 })
        }

        return NextResponse.json({ error: `API请求失败: ${response.status}` }, { status: 500 })
      }

      const data = await response.json()

      if (data.code !== 0) {
        console.error("Coze Workflow Error:", data)
        return NextResponse.json({ error: data.msg || "工作流执行失败" }, { status: 500 })
      }

      // 解析返回的数据
      let resultData
      try {
        resultData = JSON.parse(data.data)
      } catch (parseError) {
        console.error("Failed to parse result data:", parseError)
        return NextResponse.json({ error: "返回数据格式错误" }, { status: 500 })
      }

      // 验证必要字段
      if (!resultData.audio || !resultData.cover_url) {
        console.error("Missing required fields in result:", resultData)
        return NextResponse.json({ error: "返回数据不完整，缺少音频或封面" }, { status: 500 })
      }

      return NextResponse.json({
        audio: resultData.audio,
        cover_url: resultData.cover_url,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json({ error: "请求超时，请稍后重试。文章转换通常需要3-5分钟时间。" }, { status: 408 })
      }

      console.error("Fetch error:", fetchError)
      return NextResponse.json({ error: "网络请求失败，请检查网络连接" }, { status: 500 })
    }
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 })
  }
}
