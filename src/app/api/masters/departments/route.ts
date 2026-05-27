import {
  getDepartmentsHandler,
  postDepartmentHandler,
} from "@/features/masters/server"

export async function GET() {
  return getDepartmentsHandler()
}

export async function POST(request: Request) {
  return postDepartmentHandler(request)
}
