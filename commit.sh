set -e

echo 'Staging changes ...'
git add .
read -p 'Commit message: ' message
echo 'Commiting changes ...'
git commit -m "$message"
read -p 'Push changes? (y/n)' push
if [ $push == 'y' ]; then
    echo 'Pushing changes ...'
    git push
else
    echo 'Not pushing changes.'
fi