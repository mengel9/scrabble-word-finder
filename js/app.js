angular.module('scrabble', [])

  .factory('FindWords', function(ConnectToJsonFile){

    var permutations = [];

    return {
      add: function(newWord) {
        
        permutations = [];  

        var allAnagrams = function(string) {
          var anagrams = {};
          var finder = function(combination, copy) {
            if (combination.length === 2 || combination.length === 3 || combination.length === 4 || combination.length === 5 || combination.length === 6 || combination.length === 7  ) {
              permutations.push(combination);
              anagrams[combination] = true;
            }

            for (var i = 0 ; i < copy.length; i++) {
              finder(combination + copy[i], copy.slice(0, i) + copy.slice(i + 1));
            }
          };        
          finder("", string);
          return Object.keys(anagrams);
        };
   
        allAnagrams(newWord);        
        this.findReal();
      
      },
      findReal: function(){
        _.each(permutations, function(item) {
          return ConnectToJsonFile.isRealWord(item);
        });
        ConnectToJsonFile.findDef();
        ConnectToJsonFile.clear();
      }
    }
  })

  .factory('ConnectToJsonFile', function($http, ConnectToWordsApi){
    
    var realWords = [];

    return {
      isRealWord: function(word) {
        if (dictionaryWords[word] === 'true') {
          realWords.push(word);
        }
      },
      findDef: function(){
        _.each(realWords, function(item) {
          ConnectToWordsApi.getDef(item);
        });
      },
      clear: function() {
        realWords = [];
      }
    }
  })

  .factory('ConnectToWordsApi', function($http){

    var words = [];

    return {
      getDef: function(word) {
        $http.get('http://api.wordnik.com/v4/word.json/' + word + '/definitions?limit=200&includeRelated=true&useCanonical=false&includeTags=false&api_key=1e43b55248f1b238b504b24d3130782d1f9c87256f7200a5b')
          .success(function(response) {
            if (response.length) {
              words.push({ word: response[0].word, partOfSpeech: response[0].partOfSpeech, definition: response[0].text, wordLength: response[0].word.length });              
            }
            console.log('these are the words', words);
          })
          .error(function(err) {
            console.log('No Word Found', err);
          })
      },
      add: function (realWord) {
        words.push(realWord);
      },
      get: function() {
        return words;
      }

    }
  })

  .controller('WordFinder', function($scope, FindWords, ConnectToWordsApi){

    $scope.findCombos = function(newWord){
      if (newWord.length <= 9) {
        FindWords.add(newWord);
      } else {
        alert('Please provide fewer than 7 letters');
      }
    }

    $scope.words = ConnectToWordsApi.get();

  })

