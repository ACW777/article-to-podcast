"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, Download, ExternalLink, Headphones, FileAudio, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ProcessingResult {
  audio: string
  cover_url: string
}

// 支持的平台列表
const SUPPORTED_PLATFORMS = [
  {
    name: "微信公众号",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /mp\.weixin\.qq\.com\//.test(url),
    color: "from-green-400 to-green-600",
  },
  {
    name: "知乎专栏",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /zhuanlan\.zhihu\.com\//.test(url),
    color: "from-blue-400 to-blue-600",
  },
  {
    name: "百度百家号",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /baijiahao\.baidu\.com\//.test(url),
    color: "from-yellow-400 to-yellow-600",
  },
  {
    name: "CSDN博客",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /csdn\.net\//.test(url),
    color: "from-red-400 to-red-600",
  },
  {
    name: "简书",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /jianshu\.com\//.test(url),
    color: "from-pink-400 to-pink-600",
  },
  {
    name: "今日头条",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /toutiao\.com\//.test(url),
    color: "from-orange-400 to-orange-600",
  },
  {
    name: "新浪新闻",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /sina\.com\.cn\//.test(url),
    color: "from-gray-400 to-gray-600",
  },
  {
    name: "网易新闻",
    logo: "/placeholder-logo.svg",
    test: (url: string) => /163\.com\//.test(url),
    color: "from-indigo-400 to-indigo-600",
  },
  // ... 可继续扩展
]

export default function ArticleToPodcast() {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState("")

  const steps = [
    "正在获取文章内容...",
    "正在分析文章结构...",
    "正在生成播客脚本...",
    "正在合成语音...",
    "正在生成封面图片...",
    "正在完成最后处理...",
  ]

  // 检测当前输入的URL属于哪个平台
  const detectedPlatform = useMemo(() => {
    if (!url) return null
    return SUPPORTED_PLATFORMS.find((p) => p.test(url)) || null
  }, [url])

  const simulateProgress = () => {
    let currentProgress = 0
    let stepIndex = 0

    const interval = setInterval(
      () => {
        if (currentProgress < 95) {
          // 模拟进度增长
          const increment = Math.random() * 3 + 1
          currentProgress = Math.min(currentProgress + increment, 95)
          setProgress(currentProgress)

          // 更新步骤
          const newStepIndex = Math.floor((currentProgress / 95) * steps.length)
          if (newStepIndex !== stepIndex && newStepIndex < steps.length) {
            stepIndex = newStepIndex
            setCurrentStep(steps[stepIndex])
          }
        }
      },
      2000 + Math.random() * 1000,
    ) // 2-3秒间隔

    return interval
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsProcessing(true)
    setProgress(0)
    setResult(null)
    setError("")
    setCurrentStep(steps[0])

    // 开始进度模拟
    const progressInterval = simulateProgress()

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "处理失败")
      }

      // 完成进度
      clearInterval(progressInterval)
      setProgress(100)
      setCurrentStep("处理完成！")

      setTimeout(() => {
        setResult(data)
        setIsProcessing(false)
      }, 500)
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : "处理过程中出现错误")
      setIsProcessing(false)
      setProgress(0)
      setCurrentStep("")
    }
  }

  const resetForm = () => {
    setUrl("")
    setResult(null)
    setError("")
    setProgress(0)
    setCurrentStep("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.05),transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full blur-lg opacity-30" />
              <div className="relative p-4 bg-gradient-to-r from-blue-600 via-blue-700 to-amber-600 rounded-full shadow-xl">
                <Headphones className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-amber-600 bg-clip-text text-transparent">
                文章转播客
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full mx-auto mt-2" />
            </div>
          </div>
          <p className="text-slate-600 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            将任何文章转换为专业播客，让阅读变成聆听的艺术
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-slate-400 to-amber-500" />

          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-3xl font-bold text-slate-800 mb-2">开始转换</CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              输入文章链接，我们将为您生成高质量的播客音频和精美封面
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            {!result && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="url" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    文章链接
                  </label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="请输入文章URL，例如：https://mp.weixin.qq.com/s/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                    className="h-14 text-base border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
                  />
                  {/* 支持平台展示 */}
                  <div className="flex flex-wrap gap-3 mt-2 items-center">
                    {SUPPORTED_PLATFORMS.map((platform) => (
                      <div
                        key={platform.name}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full shadow text-sm font-medium bg-gradient-to-r ${detectedPlatform?.name === platform.name ? platform.color + ' text-white scale-110' : 'from-slate-100 to-slate-200 text-slate-600'} transition-all duration-200`}
                      >
                        <img src={platform.logo} alt={platform.name} className="w-5 h-5 rounded-full" />
                        {platform.name}
                      </div>
                    ))}
                  </div>
                  {/* 平台识别提示 */}
                  {url && !detectedPlatform && (
                    <div className="text-red-500 text-xs mt-2 font-semibold animate-pulse">
                      暂不支持该平台的文章，欢迎反馈！
                    </div>
                  )}
                  {url && detectedPlatform && (
                    <div className="text-green-600 text-xs mt-2 font-semibold">
                      已识别平台：{detectedPlatform.name}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!url.trim() || isProcessing}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      正在处理中...
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 mr-3" />
                      开始转换
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Processing Status */}
            {isProcessing && (
              <div className="space-y-8 py-12">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full blur-xl opacity-30 animate-pulse" />
                    <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 via-slate-700 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">正在处理您的文章</h3>
                  <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">请耐心等待，整个过程大约需要 3-5 分钟</p>
                </div>

                <div className="space-y-6 max-w-md mx-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">处理进度</span>
                    <span className="text-lg font-bold text-amber-600">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-4" />
                  <p className="text-center text-blue-700 font-semibold text-lg animate-pulse">{currentStep}</p>
                </div>

                <Alert className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 max-w-2xl mx-auto">
                  <AlertDescription className="text-amber-800 font-medium text-center">
                    💡 处理过程中请不要关闭页面，我们正在为您精心制作播客内容
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                <AlertDescription className="text-red-800 font-medium">❌ {error}</AlertDescription>
              </Alert>
            )}

            {/* Result Display */}
            {result && (
              <div className="space-y-8 py-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-xl opacity-30" />
                    <div className="relative w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                      <FileAudio className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-green-600 mb-3">转换完成！</h3>
                  <p className="text-slate-600 text-lg">您的播客已经准备就绪</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Cover Image */}
                  <Card className="overflow-hidden border-2 border-slate-200 shadow-xl">
                    <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-blue-50">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-amber-500 rounded-lg">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                        播客封面
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                        <Image
                          src={result.cover_url || "/placeholder.svg"}
                          alt="播客封面"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-6 h-12 border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                        onClick={() => window.open(result.cover_url, "_blank")}
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        查看大图
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Audio Player */}
                  <Card className="border-2 border-slate-200 shadow-xl">
                    <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-amber-50">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                        <div className="p-2 bg-gradient-to-r from-amber-500 to-blue-600 rounded-lg">
                          <FileAudio className="w-5 h-5 text-white" />
                        </div>
                        播客音频
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <audio controls className="w-full" preload="metadata">
                          <source src={result.audio} type="audio/mpeg" />
                          您的浏览器不支持音频播放。
                        </audio>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 transition-all duration-200"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = result.audio
                          link.download = "podcast.mp3"
                          link.click()
                        }}
                      >
                        <Download className="w-5 h-5 mr-2" />
                        下载音频
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="px-12 h-12 text-lg border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                  >
                    转换新文章
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-slate-500 text-sm bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full" />
            支持平台：{SUPPORTED_PLATFORMS.map(p => p.name).join('、')}，持续扩展中
            <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-blue-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
