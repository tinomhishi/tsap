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
                                <b-form-group label="Enter a Hashtag">
                                    <b-form-input v-model="hashtag" placeholder="#hashtag" />
                                </b-form-group>
                            </b-col>
                            <b-col class="col-md-6">
                                <span style='font-size:50px;' v-if="avgTweetSentiment < 0">&#128530;</span>
                                <span style='font-size:50px;' v-else-if="avgTweetSentiment > 0">&#128515;</span>
                                <span style='font-size:50px;' v-else>&#128528;</span>
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
                    <b-card-body style="max-height: 350px;overflow-y: scroll " id="tweetsSection">

                        <b-card v-for="tweet in tweets" :key="tweet.id">
                            <p class="float-left" style="margin-left: 15px">
                                <i class="fa fa-twitter" style="color: #1DA1F2"></i>
                                {{ tweet.user.name }}
                            </p>
                            <b-card-body style="margin-top: 15px">
                                <p>{{ tweet.text }}</p>
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
        hashtag: '',
        }
    },
    watch: {
        // watch for changes to tweets coming in from socket
        // in order to recalculate average sentiment
        tweets () { 
            this.getAvgTweetSentiment(this.tweets)
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
        openSocket () {
            let connection = new WebSocket(socketURL);
            
            connection.onopen = () => {
                console.log('Socket opened');
                this.socketOpen = true;
            }
            connection.onerror = (error) => {
                console.log('Socket error: ' + error);
            }
            // on every incoming request, add to tweets array and recalculate average sentiment
            connection.onmessage = (event) => {
                let data = JSON.parse(event.data);
                this.tweets.push(data);                
            }            
        }
        ,
        getAvgTweetSentiment (tweets) {
            let totalSentiment = 0;
            for (let tweet of tweets) {
                totalSentiment += tweet.sentiment;
            }
            return totalSentiment / tweets.length;
        }
    }

    
 
}
</script>