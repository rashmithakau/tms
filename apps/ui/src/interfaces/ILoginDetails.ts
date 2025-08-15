export interface ILoginDetails {
    email: string;
    password:string;
  }

  export interface IChangePwdFirstLogin {
    userId:string
    currentPassword: string;
    newPassword: string;
  }

  