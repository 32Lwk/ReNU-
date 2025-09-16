import React, { useState, useEffect } from 'react';

const ExternalAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isExternalAccess, setIsExternalAccess] = useState(false);

  useEffect(() => {
    // 外部アクセスかどうかを判定
    const hostname = window.location.hostname;
    const isExternal = hostname === 'renuda.ddns.net' || 
                      hostname.includes('.ddns.net') ||
                      (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.'));
    
    setIsExternalAccess(isExternal);
    
    if (isExternal) {
      // 外部アクセスの場合、認証状態をチェック
      const authStatus = localStorage.getItem('externalAuth');
      setIsAuthenticated(authStatus === 'authenticated');
    } else {
      // ローカルアクセスの場合は認証不要
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = async (username, password) => {
    // 外部アクセス用の認証情報
    const validCredentials = {
      'renu': 'renurenu',
    };

    if (validCredentials[username] === password) {
      localStorage.setItem('externalAuth', 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('externalAuth');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // ローカルアクセスの場合は認証不要
  if (!isExternalAccess) {
    return children;
  }

  // 外部アクセスで認証されていない場合
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // 外部アクセスで認証済みの場合
  return (
    <div className="relative">
      {children}
      <LogoutButton onLogout={handleLogout} />
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await onLogin(username, password);
    
    if (!success) {
      setError('ユーザー名またはパスワードが正しくありません');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ReNU タイピングゲーム
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            外部アクセスにはログインが必要です
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>利用可能なアカウント:</p>
          <p>renu</p>
        </div>
      </div>
    </div>
  );
};

const LogoutButton = ({ onLogout }) => {
  return (
    <button
      onClick={onLogout}
      className="fixed top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
    >
      ログアウト
    </button>
  );
};

export default ExternalAuth;
