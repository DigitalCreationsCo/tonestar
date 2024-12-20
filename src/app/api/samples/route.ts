import fs from "fs";
import path from "path";

export async function GET(request: Request) {
    try {
        const directoryPath = path.join(process.cwd(), "public/samples");
        // Read all files in the samples directory
        const files = fs.readdirSync(directoryPath);
    
        return Response.json({
            message: "Files loaded successfully",
            files,
          });
      } catch (error: any) {
        console.error("Error reading files:", error);
        return new Response(`Error reading files: ${error.message}`, {
          status: 500,
        })
      }

}
