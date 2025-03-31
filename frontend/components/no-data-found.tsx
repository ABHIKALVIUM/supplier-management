import { FileQuestion } from "lucide-react"

export default function NoDataFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <FileQuestion className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Data Found</h2>
      <p className="text-gray-500 text-center max-w-md">
        This section is currently under development or no data is available.
      </p>
    </div>
  )
}

