export const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    // ステータスコードが200以外の場合はエラーをスロー
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetcher Error:", error);
    // エラー内容を次の処理に渡すために再スロー
    throw error;
  }
};
