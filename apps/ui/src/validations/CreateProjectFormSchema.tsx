import * as yup from 'yup'; 

const CreateProjectFormSchema = yup.object({
  projectName: yup.string().required('Project name is required'),
  billable: yup
    .string()
    .oneOf(['yes', 'no'])
    .required('Billable status is required'),
});

export default CreateProjectFormSchema;
