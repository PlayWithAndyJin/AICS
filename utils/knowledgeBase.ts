import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Document } from 'langchain/document'

// 知识库配置
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || ''
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT || ''
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'customer-service-kb'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

// 初始化Pinecone
let pinecone: Pinecone | null = null
let vectorStore: PineconeStore | null = null

export async function initPinecone() {
  if (!PINECONE_API_KEY || !PINECONE_ENVIRONMENT) {
    throw new Error('Pinecone配置缺失')
  }

  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
      environment: PINECONE_ENVIRONMENT,
    })
  }

  if (!vectorStore) {
    const index = pinecone.index(PINECONE_INDEX_NAME)
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: OPENAI_API_KEY,
    })

    vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    })
  }

  return vectorStore
}

// 文档处理函数
export async function processDocument(
  content: string,
  metadata: {
    title: string
    category: string
    source: string
    [key: string]: any
  }
) {
  try {
    const vectorStore = await initPinecone()
    
    // 文本分割
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })
    
    const docs = await textSplitter.createDocuments([content], [metadata])
    
    // 存储到向量数据库
    await vectorStore.addDocuments(docs)
    
    return { success: true, message: '文档处理成功' }
  } catch (error) {
    console.error('文档处理失败:', error)
    return { success: false, message: '文档处理失败', error }
  }
}

// 知识检索函数
export async function searchKnowledge(query: string, topK: number = 5) {
  try {
    const vectorStore = await initPinecone()
    
    // 相似性搜索
    const results = await vectorStore.similaritySearch(query, topK)
    
    return results.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata,
      score: doc.score || 0
    }))
  } catch (error) {
    console.error('知识检索失败:', error)
    return []
  }
}

// 构建上下文提示
export function buildContextPrompt(query: string, knowledgeResults: any[]) {
  if (knowledgeResults.length === 0) {
    return `用户问题：${query}\n\n注意：在知识库中未找到相关信息，请基于通用知识回答，并建议用户联系人工客服获取更准确的帮助。`
  }

  let context = `基于以下知识库信息回答用户问题：\n\n`
  
  knowledgeResults.forEach((result, index) => {
    context += `知识片段 ${index + 1}：\n`
    context += `内容：${result.content}\n`
    context += `来源：${result.metadata.title || '未知'}\n`
    context += `分类：${result.metadata.category || '未知'}\n\n`
  })
  
  context += `用户问题：${query}\n\n`
  context += `请基于上述知识库信息准确回答用户问题。如果知识库信息不足以完全回答问题，请说明已知信息，并建议用户联系人工客服获取更多帮助。`
  
  return context
} 