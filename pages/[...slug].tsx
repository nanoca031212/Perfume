import { getAllProducts } from '@/lib/products'
import { Product } from '@/types/product'
import BaseCollection from '@/components/collections/BaseCollection'

// Tipos de página e suas configurações
const pageConfigs = {
  'mens': {
    title: "Men's Fragrances",
    description: 'Discover our collection of premium men\'s fragrances',
    tag: 'men'
  },
  'womens': {
    title: "Women's Fragrances",
    description: 'Explore our luxury women\'s fragrances',
    tag: 'women'
  },
  'offers': {
    title: 'Special Offers',
    description: 'Exclusive deals on premium fragrances',
    tag: 'offers'
  },
  'gifting': {
    title: 'Gift Sets',
    description: 'Perfect fragrance gifts for every occasion',
    tag: 'gift-set'
  },
  'vegan': {
    title: 'Vegan Fragrances',
    description: '100% vegan and cruelty-free fragrances',
    tag: 'vegan'
  },
  'kids': {
    title: 'Kids Fragrances',
    description: 'Gentle fragrances for children',
    tag: 'kids'
  }
} as const

// Subpáginas e suas configurações
const subPageConfigs = {
  'new': {
    title: 'New In',
    description: 'Our latest arrivals',
    tag: 'new-in'
  },
  'bestsellers': {
    title: 'Bestsellers',
    description: 'Our most popular fragrances',
    tag: 'bestseller'
  },
  'premium': {
    title: 'Premium',
    description: 'Luxury fragrances',
    tag: 'premium'
  }
} as const

interface DynamicPageProps {
  products: Product[]
  pageConfig: typeof pageConfigs[keyof typeof pageConfigs]
  subPageConfig?: typeof subPageConfigs[keyof typeof subPageConfigs] | null
}

export default function DynamicPage({ products, pageConfig, subPageConfig }: DynamicPageProps) {
  const title = subPageConfig ? subPageConfig.title : pageConfig.title
  const description = subPageConfig ? subPageConfig.description : pageConfig.description

  return (
    <BaseCollection
      products={products}
      title={title}
      description={description}
    />
  )
}

export async function getStaticPaths() {
  // Gerar paths para as páginas conhecidas
  const paths = [
    { params: { slug: ['mens'] } },
    { params: { slug: ['womens'] } },
    { params: { slug: ['gifting'] } },
    { params: { slug: ['vegan'] } },
    { params: { slug: ['kids'] } },
    { params: { slug: ['mens', 'new'] } },
    { params: { slug: ['mens', 'bestsellers'] } },
    { params: { slug: ['mens', 'premium'] } },
    { params: { slug: ['womens', 'new'] } },
    { params: { slug: ['womens', 'bestsellers'] } },
    { params: { slug: ['womens', 'premium'] } },
    { params: { slug: ['offers'] } }
  ]

  return {
    paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }: { params: { slug: string[] } }) {
  const [mainPage, subPage] = params.slug
  const mainConfig = pageConfigs[mainPage as keyof typeof pageConfigs]
  const subConfig = subPage ? subPageConfigs[subPage as keyof typeof subPageConfigs] : null

  if (!mainConfig) {
    return {
      notFound: true
    }
  }

  const allProducts = getAllProducts()
  let filtered = allProducts.filter((product: Product) => product.tags.includes(mainConfig.tag))

  // Aplica filtro adicional se houver subpágina
  if (subConfig) {
    filtered = filtered.filter((product: Product) => product.tags.includes(subConfig.tag))
  }

  return {
    props: {
      products: filtered,
      pageConfig: mainConfig,
      subPageConfig: subConfig
    },
    revalidate: 3600 // Revalidar a cada hora
  }
}
