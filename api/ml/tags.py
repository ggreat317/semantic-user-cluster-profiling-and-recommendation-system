# THE GENRES, ANCHORS, AND FLAGS ARE ONLY FOR GENERIC CLUSTER NAME, 
# CLUSTERS ARE NOT MADE THROUGH THESE NAIVE CHANNELS
# NOR IS IT USED TO MATCH PEOPLE BASED ON, IT IS FAR TOO SHALLOW FOR A PERSONALITY FINGERPRINT
# THESE GENERIC CLUSTER NAMES ARE USED FOR UI ABSTRACTION REPLACING THE COMPLEX PROFILES/EMBEDDING

GENRES = ["Games", "Career", "Finance", "Health", "Philosophy", "Sports",
          "Politics", "Love", "Compliments", "Anime", "Shows", "Movies",
          "Books", "Religion", "Music", "Advice", "Tester", "Developer",
          "AI", "Complaints", "Fights", "Speculation", "Tehnology", "Education", "Programming",
          "Thoughts", "Growth", "Excited", "Social Media", "Small Talk", "Occupation",
          "Friendly Banter", "Cooking", "Cars", "Debates", "Internet Culture", 
          "Hate", "Machine Learning", "Murmur", "Existentialism", "Vibes", "Drugs"
          ]

ANCHORS = {
    "AI" : ["discussing LLM models like chatgpt, claude, cursor", "talking about LLMS or LLM agents", "discussing AI or data companies like palantir"],
    "Advice" : ["giving recommendations or suggestions", "offering guidance on personal decisions", "answering questions with helpful tips"],
    "Anime" : ["Talking about anime characters fighting", "talking about manga or otaku culture", "power scaling anime characters", "who would win in a versus vs fight or battle", 
               "talking about japanese culture", "discussing new anime episodes", "discussing animes like One Piece, Dragon Ball, DBZ", "discussing anime characters and shows"],
    "Books" : ["talking about things read", "have you read this?", "referencing popular books or manga", "referencing libraries, hard covers, or lightnovels"],
    "Cars" : ["talking about vehicles or brands", "discussing car performance or speed", "mentioning driving or road trips"],
    "Career" : ["talking about job opportunities or promotions", "asking about internships or companies", "discussing career growth or work experience"],
    "Cooking" : ["talking about food", "asking for recipes", "describing food"],
    "Complaints" : ["talking about issues or annoyances", "expressing dissatisfaction or problems", "venting about experiences or services"],
    "Compliments" : ["praising someone or something", "saying someone looks good or talented", "complimenting achievements or skills"],
    "Developer" : ["talking about clusters or embeddings", "referencing backend, frontend, user interface"],
    "Debates" : ["arguing different opinions or perspectives", "discussing controversial topics", "challenging someone else's viewpoint"],
    "Drugs" : ["talking about substances or medication", "discussing effects or experiences", "mentioning recreational or prescription use"],
    "Education" : ["talking about school, assignments, or teachers", "asking what college or university or uni people go to", "declaring their major or degree", "mentioning what they study", 
                   "talking about peers, classmates, or other students"],
    "Existentialism" : ["talking about the meaning of life", "questioning existence or purpose", "reflecting on human nature or mortality"],
    "Excited" : ["expressing excitement or joy", "talking energetically about events", "using exclamations or enthusiasm"],
    "Fights" : ["discussing physical or verbal fights", "talking about rivalries or conflicts", "mentioning arguments or confrontations"],
    "Finance" : ["talking about money management or investing", "discussing stocks, crypto, or financial news", "asking about budgets or savings"],
    "Friendly Banter" : ["joking about someone", "joking while cursing about another", "lmfao", "lol"],
    "Games" : ["talking about video games or board games", "discussing game strategies or tactics", "referencing consoles like ps5, xbox, switch", "talking about game characters or RPGs"],
    "Hate" : ["expressing anger or dislike", "talking about things they hate", "discussing negative feelings towards someone or something"],
    "Health" : ["talking about fitness or exercise routines", "discussing diet or nutrition", "mentioning mental health or wellness tips"],
    "Internet Culture" : ["referencing memes", "67 6 7", "emoticons"],
    "Love" : ["asking or discussing about romantic partners", "talking about dating life or exes", "mentioning boyfriends or girlfriends"],
    "Machine Learning" : ["talking about models, training, or datasets", "discussing neural networks or AI research", "sharing ML experiments or results"],
    "Movies" : ["talking about films or movies", "discussing actors, directors, or genres", "reviewing movies or recommending films"],
    "Murmur" : ["rambling about own thoughts", "talking to their self"],
    "Music" : ["talking about what people listen to", "recommending artists", "mentioning music genres", "talking about genres like alt-rock, rap, or pop",
                "naming big artists like taylor swift", "mentioning underground artists"],
    "Occupation" : ["talking about jobs or professions", "mentioning roles or titles", "asking about work experience"],
    "Philosophy" : ["talking about abstract concepts", "meaning of life", "questioning what it means to be a person"],
    "Politics" : ["talking about major news", "american news", "referencing political figures", "talking about epstien files", "talking about Israel, Palestine, or Zionism", "discussing wars or protests"],
    "Programming" : ["talking about coding or programming languages", "discussing algorithms, bugs, or code fixes", "sharing coding projects or challenges"],
    "Religion" : ["talking about faith or beliefs", "discussing religious practices or rituals", "asking questions about spiritual topics"],
    "Shows" : ["talking about tv series or web series", "discussing episodes or plot twists", "mentioning actors or characters in shows"],
    "Small Talk" : ["short greetings or introductions", "hey", "how are you doing?", "checking in on people", "how have you been?", "talking about recent events in their life"],
    "Social Media" : ["talking about trends", "referencing Tiktok, InstaGram, Murmur, Facebook, Discord", "asking for socials", "do you have instagram?"],
    "Speculation" : ["guessing about future events or outcomes", "discussing what if scenarios", "sharing personal theories or thoughts"],
    "Technology" : ["talking about gadgets or devices", "discussing software or apps", "mentioning tech trends or innovations"],
    "Tester" : ["talking about running tests"],
    "Thoughts" : ["sharing personal thoughts or reflections", "rambling about ideas or concepts", "talking about internal feelings or opinions"],
    "Vibes" : ["talking about moods or feelings", "describing atmospheres or settings", "sharing impressions or energy of places"],
}


FLAGS = ["offensive", "hate", "harassment", "aggresive", "explicit"]