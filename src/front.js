const { createApp, reactive } = Vue;
// const { axios } = Axios;
const MAXLEN = 3;
const TIMES = 4; //繰り返す回数

const QuizData = reactive({
    word_list: ["tomato", "internet", "urban", "design", "game", "glass", "money", "book", "beach"],
    select_list: [], //画像生成に選んだ単語リスト
    spec_list: [], //推測者が選んだリスト
    imgsrc: "",
    turn_flag: false, //選ぶ人 false-> A, true->B
    end_flag: 0,      //終了判定フラグ
    componentId: "start",
    a_point: 0,
    b_point: 0,
    a_name: "",
    b_name: "",
});

const app = createApp({
    data() {
        return {
            componentId: QuizData.componentId,
            turn_flag: QuizData.turn_flag,
        }
    },
    computed: {
        currentId() {
            return QuizData.componentId;
        },
        currentflag() {
            return QuizData.turn_flag;
        }
    },
})

app.component(
    'start',
    {
        data() {
            return {
                a_name: "",
                b_name: "",
            }
        },
        methods: {
            start() {
                QuizData.a_name = this.a_name;
                QuizData.b_name = this.b_name;

                QuizData.componentId = "select-word";
            }
        },
        template: `
            <div class="start">
                <p class="title">AI Speculation Quiz</p>
                <div>
                    <div class="inputs">
                        <input v-model="a_name" class="inputname player1" type="text" placeholder="プレイヤー1の名前を入力してください" />
                        <input v-model="b_name" class="inputname player2" type="text" placeholder="プレイヤー2の名前を入力してください" />
                    </div>
                    <div>
                        <button @click="start" class="btn btn-border make">始める</button>
                    </div>
                </div>
                
                

                <h3>Let's enjoy!!</h3>

                <h2><a href="#inline" class="inline">遊び方</a></h2>

                <div class="modaal" id="inline" style="display:none;">
                このゲームは二人用です。
                一台のPC、スマートフォンで遊ぶことを想定しています。
                画像生成AI(<a href="https://labs.openai.com/">DALL-E</a>)を用いています。
                    <ol>
                        <li>プレイヤー1が9個の単語の中から1~3個選びます。</li>
                        <li>選んだ単語を基に画像が自動生成され、プレイヤー2が推測するターンになります</li>
                    </ol>
                    <div class="right">
                        <div class="btn-box">
                            <a href="#inline2" class="inline2 btn btn-border make">次へ</a>
                        </div>
                    </div>
                </div>

                <div class="modaal" id="inline2" style="display:none;">
                    <ol>
                        <li>プレイヤー2は生成された画像を見て、生成に使われた単語を推測します。</li>
                        <li>プレイヤー1が選んだ単語とプレイヤー2が選んだ単語が照合され、一致した単語数がプレイヤー2のポイントとして加算されます。</li>
                    </ol>
                    <div class="flex-btn">
                        <div class="left">
                            <div class="btn-box">
                                <a href="#inline" class="inline btn btn-border make">戻る</a>
                            </div>
                        </div>
                        <div class="right">
                            <div class="btn-box">
                                <a href="#inline3" class="inline3 btn btn-border make">次へ</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modaal" id="inline3" style="display:none;">
                    <ol>                  
                        <li>プレイヤー1とプレイヤー2の役割を交代します。</li>
                        <li> 1~5を4回繰り返し、最終ポイントが高いほうが勝利です。</li>
                    </ol>
                    <div class="left">
                        <div class="btn-box">
                            <a href="#inline2" class="inline2 btn-box btn btn-border make">戻る</a>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
)

//画像を生成するための単語を選ぶコンポーネント
app.component(
    'select-word',
    {
        data() {
            return {
                word_list: QuizData.word_list,
                select_list: [],
                turn_flag: QuizData.turn_flag,
                btn_list: document.querySelectorAll('.word'), //選択ボタンのDOMリストを取得
                make_mes: "作成する",
                imgsrc: QuizData.imgsrc,
                made: false, //作成フラグ
                notok: false,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        methods: {
            input_answer(word) {
                this.btn_list = document.querySelectorAll('.word');
                let old_word = "";
                if (!this.select_list.includes(word)) {
                    if (this.select_list.length >= MAXLEN) {
                        old_word = this.select_list[0];
                        this.select_list.push(word);
                        this.select_list.shift();
                    }
                    else {
                        this.select_list.push(word);
                    }
                } else {
                    old_word = word;
                    this.select_list.splice(this.select_list.indexOf(old_word), 1);
                }

                // this.select_list = Array.from(new Set(this.select_list));

                for (let i = 0; i < this.btn_list.length; i++) {
                    if (old_word == this.btn_list[i].id) {
                        this.btn_list[i].style.color = "#000";
                        this.btn_list[i].style.background = "#fff";
                    } else if (word == this.btn_list[i].id) {
                        this.btn_list[i].style.color = "#fff";
                        this.btn_list[i].style.background = "#000";
                    }
                }
                return console.log(word);
            },
            makeimg() {
                if (this.select_list.length > 0) {
                    this.notok = false;
                    let words = `${this.select_list[0]} ${this.select_list[1]} ${this.select_list[2]}`
                    let post = axios.post("/", { word: words }).then((response) => {
                        console.log("postで送信");
                        console.log(response);
                        this.catchimg(response.data);
                    }).catch((err) => {
                        console.log("エラー");
                        console.log(err);
                    });
                } else {
                    this.notok = true;
                }
            },
            catchimg(img) {
                //imgはbase64形式
                QuizData.select_list = this.select_list; //正解を格納
                QuizData.imgsrc = "data:image/png;base64," + img;
                this.make_mes = "作り直す"
                this.imgsrc = QuizData.imgsrc;
                this.made = true;

            },
            set_q() {
                QuizData.componentId = "answer";
            },
            computed: {
                ret_img() {
                    return this.imgsrc
                }
            }
        },
        template: `
        <h1 v-if="!turn_flag" class="player1"><span style="font-size:2em;">{{ a_name }}</span>  が出題者です</h1>
        <h1 v-else class="player2"><span style="font-size:2em;">{{ b_name }}</span>  が出題者です</h1>
        <h3>単語を1～3つ選んでください</h3>
        <div class="wordbtn">
            <div v-for="i in word_list" :key="i" class="btndiv">
                <button @click="input_answer(i)" :id="i" class="btn btn-border word">{{ i }}</button>
            </div>
        </div>
        <div class="selected_list">
            <span v-for="i in select_list" :key="i" class="selected">
                {{ i }}
            </span>
        </div>
        <div>
            <button @click="makeimg" class="btn btn-border make">
                {{ make_mes }}
            </button>
            <button v-if="made" @click="set_q" class="btn btn-border make">
                出題する
            </button>
            <div v-if="notok">
                単語を一つ以上選んでください
            </div>
            <div v-if="made">
                <img id="img" :src="imgsrc" width="256" height="256"/>
            </div>
        </div>
        `
    }
)

// 推測者のターンを表示するコンポーネント
app.component(
    'turn-guess',
    {
        data() {
            return {

            }
        },
        template: `
            <h4>単語を当てる人のターンです</h4>
            <p>画像を作った単語を、最大3つまで推測して選んでください</p>
        `
    }
)
//推測画面を表示するコンポーネント
app.component(
    'answer',
    {
        data() {
            return {
                word_list: QuizData.word_list,
                turn_flag: QuizData.turn_flag,
                select_list: [], //回答者が選択した単語リスト
                imgsrc: QuizData.imgsrc,
                point: 0,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        methods: {
            input_answer(word) {
                this.btn_list = document.querySelectorAll('.word');
                let old_word = "";
                if (!this.select_list.includes(word)) {
                    if (this.select_list.length >= MAXLEN) {
                        old_word = this.select_list[0];
                        this.select_list.push(word);
                        this.select_list.shift();
                    }
                    else {
                        this.select_list.push(word);
                    }
                } else {
                    old_word = word;
                    this.select_list.splice(this.select_list.indexOf(old_word), 1);
                }

                // this.select_list = Array.from(new Set(this.select_list));

                for (let i = 0; i < this.btn_list.length; i++) {
                    if (old_word == this.btn_list[i].id) {
                        this.btn_list[i].style.color = "#000";
                        this.btn_list[i].style.background = "#fff";
                    } else if (word == this.btn_list[i].id) {
                        this.btn_list[i].style.color = "#fff";
                        this.btn_list[i].style.background = "#000";
                    }
                }
                return console.log(word);
            },
            guess_answer() {
                for (let i = 0; i < this.select_list.length; i++) {
                    let len = QuizData.select_list.length;
                    let checklist = QuizData.select_list.slice();

                    console.log(QuizData.select_list);
                    // QuizData.spec_list.push(this.select_list[i]);
                    checklist.push(this.select_list[i]);
                    let newlist = new Set(checklist);
                    if (newlist.size == len) {
                        this.point++;
                    }
                }
                QuizData.point = this.point;
                console.log(`現在の得点は${QuizData.point}です`);

                //turn_flagがfalseのときBのポイント,trueの時Aのポイントに加算
                if (QuizData.turn_flag) {
                    QuizData.a_point += QuizData.point;
                } else {
                    QuizData.b_point += QuizData.point;

                }
                console.log(`現在のAの得点は${QuizData.a_point}です`);
                console.log(`現在のBの得点は${QuizData.b_point}です`);
                QuizData.spec_list = this.select_list;
                QuizData.componentId = "result";
            }
        },
        template: `
            <h1 v-if="turn_flag" class="player1"><span style="font-size:2em;">{{ a_name }}</span>  が回答者です</h1>
            <h1 v-else class="player2"><span style="font-size:2em;">{{ b_name }}</span>  が回答者です</h1>
            <img id="img" :src="imgsrc" width="256" height="256"/>
            <div class="wordbtn">
                <div v-for="i in word_list" :key="i" class="btndiv">
                    <button @click="input_answer(i)" :id="i" class="btn btn-border word">{{ i }}</button>
                </div>
            </div>
            <h2>選んでいる単語</h2>
            <div class="selected_list">
                <span v-for="i in select_list" :key="i" class="selected">
                    {{ i }}
                </span>
            </div>
            <button type="button" @click=guess_answer class="btn btn-border make">推測する</button>
        `
    }
)

app.component(
    'result',
    {
        data() {
            return {
                point: QuizData.point,
                imgsrc: QuizData.imgsrc,
                turn_flag: QuizData.turn_flag,
                a_point: QuizData.a_point,
                b_point: QuizData.b_point,
                select_list: QuizData.select_list,
                spec_list: QuizData.spec_list,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        methods: {
            next_turn() {
                QuizData.end_flag++;
                if (QuizData.end_flag >= TIMES) {
                    console.log("おわりました");
                    QuizData.componentId = "byebye"
                } else {
                    QuizData.turn_flag = !QuizData.turn_flag;
                    QuizData.componentId = "select-word";
                }
            }
        },
        template: `
            <img id="img" :src="imgsrc" width="256" height="256" />
            <h1><span style="font-size:2em;">{{ point }}</span>つ正解!!</h1>
            <h2 v-if="turn_flag">{{ a_name }}の予想: <span v-for="i in spec_list" style="font-size:2em;" class="blackwords">「{{ i }}」  </span></h2>
            <h2 v-else>{{ b_name }}の予想: <span v-for="i in spec_list" style="font-size:2em;" class="blackwords">「{{ i }}」  </span></h2>
            <h1 >この画像は…
            <span v-for="i in select_list" style="font-size:2em;" class="blackwords">「{{i}}」  </span>
            を用いて生成されました</h1>
            <h1>現在の得点</h1>
            <h2 class="player1">{{ a_name }}: <span style="font-size:2em;">{{ a_point }}</span>点</h2>
            <h2 class="player2">{{ b_name }}: <span style="font-size:2em;">{{ b_point }}</span>点</h2>
            
            
            <button type="button" @click=next_turn class="btn btn-border make">次のターンに進む</button>
        `
    }
)
app.component( //最終ページ
    'byebye',
    {
        data() {
            return {
                a_point: QuizData.a_point,
                b_point: QuizData.b_point,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },

        methods: {
            next_game() {
                //次のゲームに向けて初期化
                QuizData.a_point = 0;
                QuizData.b_point = 0;
                QuizData.end_flag = 0;
                QuizData.turn_flag = false;
                QuizData.componentId = "select-word";
            }
        },
        template: `
            <h1><span class="player1">{{ a_name }}</span> のポイントは<span style="font-size:2em;">{{a_point }}</span>点です</h1>
            <h1><span class="player2">{{ b_name }}</span> のポイントは<span style="font-size:2em;">{{ b_point }}</span>点です</h1>
            <h1 v-if = "a_point > b_point" class="player1"><span style="font-size:2em;">{{ a_name }}</span>の勝利です</h1>
            <h1 v-else-if="a_point < b_point" class="player2"><span style="font-size:2em;">{{ b_name }}</span>の勝利です</h1>
            <h1 v-else>引き分けだぁ！</h1>
            <button type="button" @click=next_game>次のゲームへ</button>
        `
    })

app.mount("#main");