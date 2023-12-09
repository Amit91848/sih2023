interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
    };
  }
  
  const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data,
      };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        error: {
          code: response.status.toString(),
          message: errorData.message || 'Unknown error',
        },
      };
    }
  };
  
  export const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(url, options);
      return await handleApiResponse<T>(response);
    } catch (error) {
      console.error('Network error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error occurred',
        },
      };
    }
  };