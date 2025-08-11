import { CREATED } from "../constants/http";
import { saveSchema } from "../schemas/project.schema";
import catchErrors from "../utils/catchErrors";
import { createProject } from "../services/project.service";

export const createHandler=catchErrors(async (req,res)=>{
    const request=saveSchema.parse({
        ...req.body
    });

    console.log("Request body:", request);

    const project=await createProject(request);

    return res.status(CREATED).json(project);
});