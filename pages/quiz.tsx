import PerfumeQuiz from '@/components/PerfumeQuiz'
import Head from 'next/head'

export default function QuizPage() {
  return (
    <>
      <Head>
        <title>3x1 offer - Discover Your Perfect Fragrance</title>
        <meta name="description" content="Take our 3x1 offer to discover your ideal fragrance match. Answer 6 quick questions to find perfumes that suit your style and preferences." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="3x1 offer - Discover Your Perfect Fragrance" />
        <meta property="og:description" content="Take our 3x1 offer to discover your ideal fragrance match. Answer 6 quick questions to find perfumes that suit your style and preferences." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="3x1 offer - Discover Your Perfect Fragrance" />
        <meta name="twitter:description" content="Take our 3x1 offer to discover your ideal fragrance match. Answer 6 quick questions to find perfumes that suit your style and preferences." />
      </Head>
      <PerfumeQuiz />
    </>
  )
}