set -e

echo "Staging changes ..."
git add .
read -p "Commit message:" message
echo "Commiting changes ..."
git commit -m "$message"
read -p 'Push changes? (y/n)' pushresponse
if [ "$pushresponse" = 'y' ]; then
    echo "Pushing changes ..."
    git push
else
    echo "Changes commited but not pushed."
fi