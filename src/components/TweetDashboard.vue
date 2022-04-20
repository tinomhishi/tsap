<template>
    <b-container>
        <b-row>
            <b-col>
                <b-card>
                    <b-card-header style="background-color: white; color: #1DA1F2">
                        <b-card-title>
                            <h3>Tweet Dashboard</h3>
                        </b-card-title>
                    </b-card-header>
                    <b-card-body>

                        <b-row>
                            <b-col class="col-md-6">
                                <b-form @submit="handleSubmit">
                                    <b-form-group label="Enter a Hashtag">
                                        <b-form-input v-model="hashtag" placeholder="#hashtag" />
                                    </b-form-group>

                                    <b-button class="float-left" type="submit" variant="secondary">
                                        Register Hashtag  
                                    </b-button>

                                    <b-button class="float-right" type="submit" variant="warning" v-if="socketOpen" @click="closeSocket()">
                                        Stop Stream 
                                    </b-button>

                                </b-form>
                            </b-col>
                            <b-col class="col-md-6">
                                <span style='font-size:50px;' v-if="avgTweetSentiment < 0">&#128530;</span>
                                <span style='font-size:50px;' v-else-if="avgTweetSentiment > 0">&#128515;</span>
                                <span style='font-size:50px;' v-else>&#128528;</span>

                                <h3>Average Sentiment: {{avgTweetSentiment}} </h3>
                            </b-col>
                        </b-row>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>

        <b-row>
            <b-col>
                <b-card>
                    <b-card-header style="background-color: #1DA1F2; color: white">
                        <b-card-title>
                            <h4 style="text-align: left; padding-left: 15px">Tweets</h4>
                        </b-card-title>
                    </b-card-header>
                    <b-card-body style="max-height: 350px;overflow-y: scroll " id="tweetsSection" v-if="tweets" ref="tweetDiv">

                        <b-card v-for="tweet in tweets" :key="tweet.id">
                            <p class="float-left" style="margin-left: 15px" v-if="tweet.user">
                                <i class="fa fa-twitter" style="color: #1DA1F2"></i>
                                {{ tweet.user.screen_name }}
                            </p>
                            <b-card-body style="margin-top: 15px">
                                <b-row>
                                    <b-col>
                                        <p>{{ tweet.text }}</p>
                                    </b-col>
                                    <b-col>
                                        <p> <strong> Sentiment Score: </strong> {{tweet.sentiment_score}}</p>
                                            <span style='font-size:50px;' v-if="tweet.sentiment_score < 0">&#128530;</span>
                                            <span style='font-size:50px;' v-else-if="tweet.sentiment_score > 0">&#128515;</span>
                                            <span style='font-size:50px;' v-else>&#128528;</span>
                                    </b-col>  
                                </b-row>

                            </b-card-body>

                            <b-card-footer style="background-color: white; border-top: none">
                                <p class="float-right" style="color: lightslategray; font-size: 15px">{{tweet.created_at}}</p>
                            </b-card-footer>
                        </b-card>



                        
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>

    </b-container>  



</template>

<script>
import axios from 'axios';
// jQuery('#tweetsSection').css("overflow-y", "scroll");
let apiUrl = 'http://test.com/api/tweets';
let socketURL = 'ws://test.com/api/tweets/socket';

//  Setting tweet section to auto scroll
// $('#tweetsSection').scrollTop($('#tweetsSection')[0].scrollHeight);





export default {
    name: 'TweetDashboard',
    data () {
        return {
        // array containing accumulated tweets
        tweets: [],
        // bool to indicated whether a socket is open
        socketOpen: false,
        // average sentiment of tweets incoming
        avgTweetSentiment: 0,
        // hashtag to search for
        hashtag: [],
        socketConnection: null,
        }
    },
    watch: {
        // watch for changes to tweets coming in from socket
        // in order to recalculate average sentiment
        tweets () { 
            // console.log("SETTING")
            // this.setAvgTweetSentiment(this.tweets)
        },
    },

    methods: {
        // function to register hashtag with api backend
        // to trigger stream of tweets based on hashtag
        async registerHashTag (hashtag) {
            this.hashtag = hashtag;
            let url = apiUrl + '/' + hashtag;
            axios.get(url)
            .then(response => {
                if (response.status==200) {
                    this.openSocket();
                }else{
                    this.socketOpen = false;                    
                }
            }).catch(function (error) {
                console.log(error);
            });
        },
        // function to open socket connection
        openSocket (socketURL) {
            console.log("\n\n\n\nOpening Socket\n\n\n")
            let connection = new WebSocket(socketURL);

            connection.onopen = () => {
                console.log('Socket opened');
                this.socketOpen = true;
                this.socketConnection = connection;
            }

            connection.onerror = (error) => {
                console.log('Socket error: ' + error);
            }
            // on every incoming request, add to tweets array and recalculate average sentiment
            connection.onmessage = (event) => {
                console.log('Socket message: ' + event.data);
                let data = JSON.parse(event.data);
                this.tweets.push(data);                
            }            
        },
        // function to close socket connection
        closeSocket () {
            console.assert('Closing Socket');
            this.socketConnection.close();
            this.socketOpen = false;
        },
        getAvgTweetSentiment (tweets) {
            let totalSentiment = 0;
            for (let tweet of tweets) {
                totalSentiment += tweet.sentiment;
            }
            return totalSentiment / tweets.length;
        },
        setAvgTweetSentiment (tweets) {
            console.log("SETTING AVG: " + tweets.length)
            var totalSentiment = 0;
            for (let tweet of tweets) {
                if (tweet.sentiment_score) {
                    totalSentiment += tweet.sentiment_score;
                }else{
                    console.log("No sentiment score")
                }

            }
            console.log('Vars', totalSentiment, tweets.length);
            this.avgTweetSentiment = (totalSentiment / tweets.length).toFixed(2);
            console.log('AverageX: '+ this.avgTweetSentiment);
        },
        handleSubmit (e) {
            let socketUrl = 'ws://localhost:8000/ws/connect/?' 
            let queryString = encodeURI(this.hashtag.split(" ").map(function(word) {
                return "hashtag=" + word + "&";
            }));
            let url = socketUrl + queryString.replaceAll(",", "");
            e.preventDefault();
            // alert('Submitted Queries' + ' ' +  url);
            this.openSocket(url);
        },
        // Method to scroll to bottom of tweets section
        scrollToBottom () {
            var content = this.$refs.tweetDiv
            content.scrollTop = content.scrollHeight;
        }
    },
    updated () {
        this.scrollToBottom();
        this.setAvgTweetSentiment(this.tweets);

    },
    mounted () {
        this.scrollToBottom();
    }

    
 
}
</script>