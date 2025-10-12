// Allow importing CSS and other static asset files as modules for TypeScript
declare module '*.css'
declare module '*.scss'
declare module '*.sass'
declare module '*.module.css'
declare module '*.module.scss'
declare module '*.module.sass'

// Images
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.webp'
declare module '*.svg' {
  const content: string
  export default content
}

// Allow importing JSON with unknown shape
declare module '*.json'
