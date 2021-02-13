const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/fetcher');

mongoose.connect(process.env.MONGODB_URI)
  .catch((err) => {
    console.log('Error connecting mongoose, ', err);
  })

/* Top 25: number of forks... more forks at the top of the list */

let repoSchema = mongoose.Schema({
  owner_name: String,
  repos: {
    type: Array,
    repo_id: Number,
    repo_name: String,
    repo_url: String,
    repo_description: String,
    repo_forks: Number
  }
});

let Repo = mongoose.model('Repo', repoSchema);

let save = (newDocument) => {
  // TODO: Your code here
  // This function should save a repo or repos to
  // the MongoDB

  /*  Use this to remove all documents from db while testing  */
  // Repo.remove({}, () => {
  //   console.log('removed')
  // })

  Repo.findOne({owner_name: newDocument.owner_name}, (err, doc) => {
    if (err) {
      return handleError(err);
    } else if (!doc) {
      var repoSchemaInstance = new Repo({
        owner_name: newDocument.owner_name,
        repos: newDocument.repos
      })
      repoSchemaInstance.save()
        .then(() => {
          console.log('Successfully saved repos');
        })
        .catch((err) => {
          console.log('Error while saving repo: ', err);
        })
    } else {
      console.log('Document already exists for this username');
      return doc;
    }
  })
  .catch((err) => {
      console.log('Error querying the database (findOne): ', err);
  })
}

let getTopRepos = () => {
  console.log('In getTopRepos');
  return Repo.find({}, (err, doc) => {
    console.log(' err: ', err);
    console.log(' doc: ', doc);

    if (err) {
      return handleError(err);
    } else {
      return Promise.resolve(doc);
    }
    })
    .then((doc) => {
      console.log('.then doc: ', doc);
      var sortedRepos = [];
      var docLength = doc.length;

      while (docLength > 0) {
        for (var i = 0; i < doc[docLength - 1].repos.length; i++) {
          var singleRepo = doc[docLength - 1].repos[i];
          singleRepo.owner_name = doc[docLength - 1].owner_name;

          sortedRepos.push(singleRepo);
        }

        docLength--;
      }

      sortedRepos.sort((a, b) => {
        return b.repo_forks - a.repo_forks;
      })

      var finalSortedRepos = sortedRepos.length > 25 ? sortedRepos.slice(0, 25) : sortedRepos;
      console.log('finalSortedRepos: ', finalSortedRepos);
      return Promise.resolve(finalSortedRepos);
    })
    .catch(() => {
      console.log('Error querying database for username: ', username);
    })
}


module.exports.save = save;
module.exports.getTopRepos = getTopRepos;