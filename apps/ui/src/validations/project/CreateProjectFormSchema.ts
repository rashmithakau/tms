import * as yup from 'yup'; 

const CreateProjectFormSchema: yup.ObjectSchema<{
  projectName: string;
  clientName: string;
  billable: 'yes' | 'no';
  supervisor: string | null;
}> = yup.object({
  projectName: yup.string().required('Project name is required'),
  clientName: yup.string().required('Client name is required'),
  billable: yup
    .mixed<'yes' | 'no'>()
    .oneOf(['yes', 'no'])
    .required('Billable status is required'),
  supervisor: yup.string().nullable().default(null),
});

export default CreateProjectFormSchema;
