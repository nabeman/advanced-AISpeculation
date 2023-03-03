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
    data(){
        return{
            componentId: QuizData.componentId,
            turn_flag: QuizData.turn_flag,
        }
    },
    computed: {
        currentId(){
            return QuizData.componentId;
        },
        currentflag(){
            return QuizData.turn_flag;
        }
    },
})

app.component(
    'start',
    {
        data(){
            return{
                a_name: "",
                b_name: "",
            }
        },
        methods: {
            start(){
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
                        <input v-model="a_name" class="inputname" type="text" placeholder="プレイヤー1の名前を入力してください" />
                        <input v-model="b_name" class="inputname" type="text" placeholder="プレイヤー1の名前を入力してください" />
                    </div>
                    <div>
                        <button @click="start" class="btn btn-border">始める</button>
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
        data(){
            return{
                word_list: QuizData.word_list,
                select_list: [],
                turn_flag:QuizData.turn_flag,
                btn_list: document.querySelectorAll('.word'), //選択ボタンのDOMリストを取得
                notok: false,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        methods: {
            input_answer(word){
                this.btn_list = document.querySelectorAll('.word');
                let old_word = "";
                if(!this.select_list.includes(word)){
                    if(this.select_list.length >= MAXLEN){
                        old_word = this.select_list[0];
                        this.select_list.push(word);
                        this.select_list.shift();
                    }
                    else{
                        this.select_list.push(word);
                    }
                }else{
                    old_word = word;
                    this.select_list.splice(this.select_list.indexOf(old_word),1);
                }

                // this.select_list = Array.from(new Set(this.select_list));

                for(let i = 0; i < this.btn_list.length; i++){
                    if(old_word == this.btn_list[i].id){
                        this.btn_list[i].style.color = "#000";
                        this.btn_list[i].style.background = "#fff";
                    }else if(word == this.btn_list[i].id){
                        this.btn_list[i].style.color = "#fff";
                        this.btn_list[i].style.background = "#000";
                    }
                }
                return console.log(word);
            },
            makeimg(){
                if(this.select_list.length > 0){
                    this.notok = false;
                    let words = `${this.select_list[0]} ${this.select_list[1]} ${this.select_list[2]}`
                    let post = axios.post("http://localhost:3000/", { word: words }).then((response) => {
                        console.log("postで送信");
                        this.catchimg(response.data);
                    }).catch((err) =>{
                        console.log("エラー");           
                        console.log(err);    
                    });
                }else{
                    this.notok = true;
                }
            },
            catchimg(img){
                //imgはbase64形式
                QuizData.select_list = this.select_list; //正解を格納
                this.select_list = [];
                QuizData.imgsrc = "data:image/png;base64," + img;
                // QuizData.turn_flag = !QuizData.turn_flag;
                QuizData.componentId = "answer";
                // document.getElementById("img").src = "data:image/png;base64," + img;
            },
        },
        template: `
        <h1 v-if="!turn_flag">{{ a_name }}が出題者です</h1>
        <h1 v-else>{{ b_name }}が出題者です</h1>
        <h2>単語を3つ選んでください</h2>
        <div class="wordbtn">
            <div v-for="i in word_list" :key="i" class="btndiv">
                <button @click="input_answer(i)" :id="i" class="btn btn-border word">{{ i }}</button>
            </div>
        </div>
        <h3 class="selectword">選んでいる単語</h3>
        <span v-for="i in select_list" :key="i" class="selected">
            {{ i }}
        </span>
        <div>
            <button @click="makeimg" class="btn btn-border">
                作成する
            </button>
            <div v-if="notok">
                単語を一つ以上選んでください
            </div>
        </div>
        `
    }
)

// 作成者と推測者のターンをスイッチするためのフラグを変えるコンポーネント
// app.component(
//     'change-turn',
//     {
//         data: function(){
//             turn_flag = false;
//             return{
//             }
//         }
//     }
// )

// 推測者のターンを表示するコンポーネント
app.component(
    'turn-guess',
    {
        data(){
            return{
                
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
        data(){
            return{
                word_list: QuizData.word_list,
                select_list: [], //回答者が選択した単語リスト
                imgsrc: QuizData.imgsrc,
                point: 0,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        methods: {
            input_answer(word){
                this.btn_list = document.querySelectorAll('.word');
                let old_word = "";
                if(!this.select_list.includes(word)){
                    if(this.select_list.length >= MAXLEN){
                        old_word = this.select_list[0];
                        this.select_list.push(word);
                        this.select_list.shift();
                    }
                    else{
                        this.select_list.push(word);
                    }
                }else{
                    old_word = word;
                    this.select_list.splice(this.select_list.indexOf(old_word),1);
                }

                // this.select_list = Array.from(new Set(this.select_list));

                for(let i = 0; i < this.btn_list.length; i++){
                    if(old_word == this.btn_list[i].id){
                        this.btn_list[i].style.color = "#000";
                        this.btn_list[i].style.background = "#fff";
                    }else if(word == this.btn_list[i].id){
                        this.btn_list[i].style.color = "#fff";
                        this.btn_list[i].style.background = "#000";
                    }
                }
                return console.log(word);
            },
            guess_answer(){
                for(let i = 0; i < this.select_list.length; i++){
                    let len = QuizData.select_list.length;
                    let checklist = QuizData.select_list.slice();

                    console.log(QuizData.select_list);
                    // QuizData.spec_list.push(this.select_list[i]);
                    checklist.push(this.select_list[i]);
                    let newlist = new Set(checklist);
                    if(newlist.size == len){
                        this.point++;
                    }
                }
                QuizData.point = this.point;
                console.log(`現在の得点は${QuizData.point}です`);
                
                //turn_flagがfalseのときBのポイント,trueの時Aのポイントに加算
                if (QuizData.turn_flag){
                    QuizData.b_point+=QuizData.point;
                }else{
                    QuizData.a_point+=QuizData.point;
                    
                }
                console.log(`現在のAの得点は${QuizData.a_point}です`);
                console.log(`現在のBの得点は${QuizData.b_point}です`);
                QuizData.spec_list = this.select_list;
                QuizData.componentId = "result";
            }
        },
        template: `
            <h1 v-if="turn_flag">{{ a_name }}が回答者です</h1>
            <h1 v-else>{{ b_name }}が回答者です</h1>
            <img id="img" :src="imgsrc" width="256" height="256"/>
            <div class="wordbtn">
                <div v-for="i in word_list" :key="i" class="btndiv">
                    <button @click="input_answer(i)" :id="i" class="btn btn-border word">{{ i }}</button>
                </div>
            </div>
            <h3>選んでいる単語</h3>
            <div v-for="i in select_list" :key="i + '_s'">
                <h4>{{ i }}</h4>
            </div>
            <button type="button" @click=guess_answer class="btn btn-border">推測する</button>
        `
    }
)

app.component(
    'result',
    {
        data(){
            return{
                point: QuizData.point,
                imgsrc: QuizData.imgsrc,
                a_point:QuizData.a_point,
                b_point:QuizData.b_point,
                select_list:QuizData.select_list,
                spec_list: QuizData.spec_list,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        methods: {
            next_turn(){
                QuizData.end_flag++;
                if(QuizData.end_flag >= TIMES){
                    console.log("おわりました");
                    QuizData.componentId = "byebye"
                }else{
                    QuizData.turn_flag = !QuizData.turn_flag;
                    QuizData.componentId = "select-word";
                }
            }
        },
        template:`
            <img id="img" :src="imgsrc" width="256" height="256" />
            <h1>{{ point }}点です</h1>

            <h1 >この画像は…
            <div v-for="i in select_list">{{i}},</div>
            を用いて生成されました</h1>
            <h1>{{ a_name }}のポイントは{{ a_point }}点です</h1>
            <h1>{{ b_name }}のポイントは{{ b_point }}点です</h1>
            <div v-for="i in spec_list">
                {{ i }}
            </div>
            <p>で推測しています</p>
            <button type="button" @click=next_turn class="btn btn-border">次のターンに進む</button>
        `
    }
)
app.component(
    'byebye',
    {
        data(){
            return{
                a_point:QuizData.a_point,
                b_point:QuizData.b_point,
                a_name: QuizData.a_name,
                b_name: QuizData.b_name,
            }
        },
        
        methods: {
            next_game(){
                //次のゲームに向けて初期化
                QuizData.a_point = 0;
                QuizData.b_point = 0;
                QuizData.end_flag = 0;
                QuizData.turn_flag = false;
                QuizData.componentId = "select-word";    
            }
        },
        template:`
            <h1>{{ a_name }}のポイントは{{a_point }}点です</h1>
            <h1>{{ b_name }}のポイントは{{ b_point }}点です</h1>
            <h1 v-if = "a_point > b_point">Aの勝利です</h1>
            <h1 v-else-if="a_point < b_point" >Bの勝利です</h1>
            <h1 v-else>引き分けだぁ！</h1>
            <button type="button" @click=next_game>次のゲームへ</button>
        `
    })

app.mount("#main");