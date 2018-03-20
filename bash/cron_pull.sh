git checkout master
gout=$(git pull 2>&1)
echo $gout
if ! [[ $gout == *"Already up-to-date." ]]
then
  echo "Source changes found..."
  ./bash/rebuild.sh
else
  echo "Source code up to date"
fi
