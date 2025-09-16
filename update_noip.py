#!/usr/bin/env python3
"""
NO-IP自動更新スクリプト
設定ファイルから認証情報を読み込んでNO-IPを更新します
"""

import requests
import json
import os
from datetime import datetime

def update_noip():
    """NO-IPのIPアドレスを更新"""
    
    # 設定ファイルを読み込み
    config_file = "noip_config.json"
    password_file = "noip_password.txt"
    
    if not os.path.exists(config_file):
        print("❌ 設定ファイルが見つかりません: noip_config.json")
        return False
    
    if not os.path.exists(password_file):
        print("❌ パスワードファイルが見つかりません: noip_password.txt")
        return False
    
    try:
        # 設定を読み込み
        with open(config_file, "r") as f:
            config = json.load(f)
        
        with open(password_file, "r") as f:
            password = f.read().strip()
        
        username = config["username"]
        hostname = config["hostname"]
        
        print(f"🌐 NO-IP更新中: {hostname}")
        print(f"👤 ユーザー: {username}")
        
        # 現在のIPアドレスを取得
        try:
            response = requests.get("https://ipinfo.io/ip", timeout=10)
            current_ip = response.text.strip()
            print(f"📍 現在のIP: {current_ip}")
        except Exception as e:
            print(f"❌ IP取得エラー: {e}")
            return False
        
        # NO-IP更新
        update_url = "https://dynupdate.no-ip.com/nic/update"
        params = {
            'hostname': hostname,
            'myip': current_ip
        }
        
        response = requests.get(
            update_url, 
            params=params,
            auth=(username, password),
            timeout=10
        )
        
        response_text = response.text.strip()
        print(f"📡 レスポンス: {response_text}")
        
        if response_text.startswith("good") or response_text.startswith("nochg"):
            print("✅ NO-IP更新成功！")
            
            # 設定を更新
            config["last_update"] = datetime.now().isoformat()
            config["last_ip"] = current_ip
            
            with open(config_file, "w") as f:
                json.dump(config, f, indent=2)
            
            print(f"🌐 アクセスURL: http://{hostname}:3000")
            print(f"🔧 API URL: http://{hostname}:8000")
            
            return True
        else:
            print(f"❌ NO-IP更新失敗: {response_text}")
            return False
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        return False

if __name__ == "__main__":
    print("🌐 NO-IP自動更新ツール")
    print("=" * 40)
    
    if update_noip():
        print("\n✅ 更新完了！")
    else:
        print("\n❌ 更新に失敗しました")
        print("\n📝 確認事項:")
        print("1. noip_config.json に正しいユーザー名が設定されているか")
        print("2. noip_password.txt に正しいパスワードが設定されているか")
        print("3. NO-IP管理画面でドメイン設定が正しいか")
        print("4. インターネット接続が正常か")
