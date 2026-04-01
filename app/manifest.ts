import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VidioCV - Transform Your Recruitment',
    short_name: 'VidioCV',
    description: 'VidioCV: A revolutionary platform that replaces static resumes with dynamic, AI-enhanced video profiles.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9F9F9',
    theme_color: '#F7B980',
    icons: [
      {
        src: '/favicon.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
