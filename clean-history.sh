#!/bin/bash
# 清理 Git 历史中的敏感信息

# 使用 git filter-branch 替换所有提交中的 API Key
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --index-filter '
    git ls-files -z | while IFS= read -r -d "" file; do
        if [ -f "$file" ]; then
            sed -i "" "s/YOUR_API_KEY_HERE/YOUR_API_KEY_HERE/g" "$file" 2>/dev/null || true
        fi
    done
    git add -A
' --prune-empty --tag-name-filter cat -- --all

echo "历史记录清理完成！"
