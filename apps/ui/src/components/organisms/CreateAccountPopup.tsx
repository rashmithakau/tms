import React, { useState } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import NumberField from '../atoms/inputFields/NumberField';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { registerUser } from '../../api/user';
import { UserRole } from '@tms/shared';

function CreateAccountPopup({ open ,role}: { open: boolean;role:UserRole ;onClose: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    designation: '',
    contactNumber: '',
  });

  const title=`${role === 'admin' ? 'Add Admin' : 'Add Employee'}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    registerUser({
      "email": formData.email,
      "firstName": formData.firstName,
      "lastName": formData.lastName,
      "designation": formData.designation,
      "contactNumber": formData.contactNumber
    },role);

  };

  const handleCancel = () => {
 
  };

 
  return (
    <PopupLayout
      open={open}
      onClose={handleCancel}
      title={title}
      maxWidth="sm"
      minHeight="300px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px',padding:5}}>
          <BaseTextField
            variant='outlined'
            label="Email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <BaseTextField
            variant='outlined'
            label="First Name"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <BaseTextField
            variant='outlined'
            label="Last Name"
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <BaseTextField
            variant='outlined'
            label="Designation"
            type="text"
            name="designation"
            placeholder="Designation"
            value={formData.designation}
            onChange={handleChange}
            required
          />
          <NumberField
            variant='outlined'
            label="Contact Number"
            name="contactNumber"
            placeholder="Contact Number"
            value={formData.contactNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <BaseBtn type="button" onClick={handleCancel} variant='outlined'>
            Cancel
          </BaseBtn>
          <BaseBtn type="submit">Submit</BaseBtn>
        </div>
      </form>
    </PopupLayout>
  );
}

export default CreateAccountPopup;