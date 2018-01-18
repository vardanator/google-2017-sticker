function evil_laugh() {
    FNAME=$RANDOM
    DATE=$1
    export GIT_MERGE_AUTOEDIT=no
    for i in {1..4}
    do
        cp a.cpp ${FNAME}${i}.cpp
        git add ${FNAME}${i}.cpp
        git commit --amend --no-edit -m "hi codetrace" --date="${DATE} 20:00:00 2017 -0600"
        git pull origin master
        git push origin master
    done
}
evil_laugh "Oct 12"
evil_laugh "Oct 18"
