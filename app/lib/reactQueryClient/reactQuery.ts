import AxiosInstance from '@/api/instance';
import {useQuery, useMutation} from '@tanstack/react-query';
import axios from 'axios';
import Enviroment from '../config/Enviroment';

export const fetchPostData = async (
  postData: any,
  apiUrl: string,
  formData?: boolean,
) => {
  //respone 데이터 반환
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  if (formData) {
    //form데이터로 요청해야할때 (파일 업로드)

    const formData = new FormData();

    // formData.append('debug_jwt' ,Enviroment.debugKey);

    for (let key in postData) {
      if (Array.isArray(postData[key])) {
        //배열데이터 formdata처리
        for (let i = 0; i < postData[key].length; i++) {
          formData.append(`${key}[${i}]`, postData[key][i]);
        }
      } else {
        formData.append(key, postData[key]);
      }
    }

    const {data} = await AxiosInstance.post(apiUrl, formData, config);

    return data;
  } else {
    const {data} = await AxiosInstance.post(
      apiUrl,
      {
        ...postData,
      },
      config,
    );

    return data;
  }
};

export const usePostQuery = (
  postKey: string,
  postData: object,
  apiUrl: string,
) => {
  //useQuery ( get )데이터 반환
  return useQuery([postKey, postData], () => fetchPostData(postData, apiUrl));
};

export const usePostMutation = (
  postKey: string,
  apiUrl: string,
  formData?: boolean,
) => {
  //useMutation ( post ) 데이터 반환
  return useMutation((postData: any) =>
    fetchPostData(postData, apiUrl, formData),
  );
};

// export default usePostQuery;
