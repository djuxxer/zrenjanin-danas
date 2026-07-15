export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          <div className="space-y-2 pt-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
