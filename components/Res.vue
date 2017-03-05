<template>
    <section>
        
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>res test</el-breadcrumb-item>
        </el-breadcrumb>

        <el-row :gutter="24" class="toolbar">
            <el-button size="small" v-if="res_config.tools" v-for="(val, key) in res_config.tools" @click="handleOperation(key)" :id="'res-' + key"><i :class="'el-icon-' + val.icon"></i> {{ val.text }}</el-button>
            <el-input size="small" class="float-right" style="width:250px" v-model="conditions.quick_search" auto-complete="off">
                <template slot="prepend">快速查找</template>
            </el-input>
        </el-row>

        <el-row :gutter="24" class="toolbar" v-if="setColumnVisible">
            <el-checkbox-group v-model="setColumnCheckList">
            <div v-for="(val, key) in res_config.set_column">
                <el-checkbox @change="handleColumnAll(key, val.text)" :label="val.text" class="font-weight-bold"></el-checkbox>&nbsp;&nbsp;&nbsp;&nbsp;
                <el-checkbox @change="handleColumnOne()" v-for="val_column in val.column" :label="res_config.columns_config[val_column]"></el-checkbox>
            </div><br>  
            </el-checkbox-group>
        </el-row>

        <el-row :gutter="24" class="toolbar" v-if="conditionsVisible">
            <el-form>
                <el-col :span="24" class="font-size-12">
                    请选择查询条件 or 在右侧的文本框输入批量查找的对象
                    <el-button size="mini" type="primary" @click="handleSearch">查询</el-button>
                    <el-button size="mini" @click="handleSearchDel">清除条件</el-button>  
                </el-col>
                <el-col :span="res_config.query.columns" v-if="res_config.query.items" v-for="(val, key) in res_config.query.items">
                    <el-form-item :label="res_config.columns_config[key]" label-width="80px">
                        <el-input v-if="val.type == 'input'" v-model="conditionsValue[key]" auto-complete="off"></el-input>
                        <el-select v-if="val.type == 'select'" v-model="conditionsValue[key]" :placeholder="res_config.columns_config[key]">
                            <el-option 
                                v-for="(option_val, option_key) in res_config.select[key]"
                                :label="option_val"
                                :value="option_key">
                            </el-option>
                        </el-select>

                        <el-date-picker
                            v-if="val.type == 'dateTimePicker'"
                            v-model="conditionsValue[key]"
                            type="datetime"
                            placeholder="选择日期时间">
                        </el-date-picker>

                        <el-input 
                            v-if="val.type == 'textarea'" 
                            type="textarea" 
                            :autosize="{ minRows: 2, maxRows: 6}" 
                            placeholder="请输入内容"
                            v-model="conditionsValue[key]"
                            >
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-form>
        </el-row>

        <el-row :gutter="24" class="data-table">
            <el-table
                :data="tableData"
                v-loading.body="tableLoading"
                @selection-change="handleSelectionChange"
                style="width: 100%">
                <el-table-column
                    type="selection"
                    width="55">
                </el-table-column>
                <el-table-column
                    v-if="res_config.default_columns"
                    v-for="val in res_config.default_columns"
                    align="center"
                    :prop="val"
                    :label="res_config.columns_config[val]">
                </el-table-column>
                <el-table-column
                    :context="_self"
                    inline-template
                    label="操作">
                    <div>
                        <el-button
                            size="small"
                            @click="handleEdit($index, row)">
                            编辑
                        </el-button>
                        <el-button
                            size="small"
                            @click="handleLog($index, row)">
                            日志
                        </el-button>
                    </div>
                </el-table-column>
            </el-table>   
        </el-row>

        <el-col :span="24">
            <el-pagination
                v-if="tableCount > length"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage" 
                :page-sizes="[10, 20, 50, 100]" 
                :page-size="length" 
                layout="total, sizes, prev, pager, next, jumper"
                :total="tableCount" 
                style="float:right">
            </el-pagination>
        </el-col>

        <!--添加，编辑界面-->
        <el-dialog :title="dialogFormTitle" v-model="dialogFormVisible">
            <el-form>
                <el-col :span="val.type == 'textarea'?24:10" v-if="dialogFormConfig" v-for="(val, key) in dialogFormConfig">
                        <el-form-item :label="res_config.columns_config[key]" :label-width="formLabelWidth">
                            <el-input v-if="val.type == 'input'" v-model="formValue[key]" auto-complete="off"></el-input>
                            <el-select v-if="val.type == 'select'" v-model="formValue[key]" :placeholder="res_config.columns_config[key]">
                                <el-option 
                                    v-for="(option_val, option_key) in res_config.select[key]"
                                    :label="option_val"
                                    :value="option_key">
                                </el-option>
                            </el-select>

                            <el-date-picker
                                v-if="val.type == 'dateTimePicker'"
                                v-model="formValue[key]"
                                type="datetime"
                                placeholder="选择日期时间">
                            </el-date-picker>

                            <el-input 
                                v-if="val.type == 'textarea'" 
                                type="textarea" 
                                :autosize="{ minRows: 2, maxRows: 6}" 
                                placeholder="请输入内容" 
                                v-model="formValue[key]">
                            </el-input>
                        </el-form-item>
                </el-col>
                <el-col :span="24" class="right padding-bottom-10">
                    <el-button @click="dialogFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSave">确 定</el-button>
                </el-col>
            </el-form>
        </el-dialog>

        <!--批量导入界面-->
        <el-dialog title="批量导入" v-model="dialogFormBatch">
            <el-form>
                <el-col :span="24">
                    <el-input 
                        type="textarea" 
                        :autosize="{ minRows: 15, maxRows: 40}"
                        :rows=15
                        placeholder="请输入内容" 
                        v-model="formBatch">
                    </el-input>
                </el-col>
                <el-col :span="24" class="right padding-bottom-10">
                    <el-button @click="dialogFormBatch = false">取 消</el-button>
                    <el-button type="primary" @click="handleBatch">确 定</el-button>
                </el-col>
            </el-form>
        </el-dialog>

        <!--批量查询界面-->
        <el-dialog title="批量查询" v-model="dialogSearchBatch">
            <el-form>
                <el-col :span="24">
                    <el-input 
                        type="textarea" 
                        :autosize="{ minRows: 15, maxRows: 40}"
                        :rows=15
                        placeholder="请输入内容" 
                        v-model="conditions.batch_query">
                    </el-input>
                </el-col>
                <el-col :span="24" class="right padding-bottom-10">
                    <el-button @click="dialogSearchBatch = false">取 消</el-button>
                    <el-button type="primary" @click="handleSearchBatch">查 询</el-button>
                </el-col>
            </el-form>
        </el-dialog>

    </section>
</template>

<script>
    var request = require('superagent');
    var merge = require('webpack-merge');
    export default {
        props: ['res_config'],
        data() {
            return {
                currentPage: 1,
                start: 0,                   //分页
                length: 10,                 //分页
                tableCount: 0,              //table总数
                tableLoading: true,
                tableData: [],              //table数据
                dialogFormTitle: '添加',    //编辑框标题
                dialogFormConfig: {},       //编辑框操作内容配置 
                dialogFormVisible: false,   //编辑框是否显示
                dialogFormBatch: false,     //批量导入框是否显示
                dialogSearchBatch: false,   //批量查询框是否显示
                setColumnVisible: false,    //显示字段框是否显示
                formLabelWidth: '80px',     //编辑框宽度
                formValue: {},              //save表单value
                formBatch: '',              //批量导入数据
                multipleSelection: [],      //表格选择值 
                conditions: {
                    batch_query: '',
                    quick_search: '',
                },                          //查询参数
                conditionsValue: {},
                conditionsVisible: false,   //高级搜索内容是否显示
                setColumnCheckList:[],      //显示字段
                where: {}
            }
        },
        mounted() {
            //设置显示字段预设值
            for(var key in this.res_config.default_columns){
                this.setColumnCheckList.push(this.res_config.columns_config[this.res_config.default_columns[key]]);
            }
            //加载表格
            this.initTable();
        },
        watch: {
            res_config(v) {
                this.initTable();
            },
        },
        methods: {
            initTable() {
                var send = {};
                send = {length: this.length, start: this.start};
                //增加配置中的搜索状态
                send = merge(send, this.res_config.api_url.list.send);
                //增加显示字段的配置
                var headers = ''
                for(var key in this.res_config.columns_config){
                    if(this.setColumnCheckList.indexOf(this.res_config.columns_config[key]) > -1){
                        headers += key + ',';
                    }
                }
                if(headers != '') {
                    send['headers'] = headers;
                }
                //搜索优先级，快速搜索 > 批量搜索 > 高级搜索
                if(this.conditions.batch_query != ''){
                    send['conditions'] = {batch_query: this.conditions.batch_query};
                } else if(this.conditions.quick_search != ''){
                    send['conditions'] = {quick_search: this.conditions.quick_search};
                }
                if(this.conditionsVisible){
                    send['conditions'] = this.conditions;
                }
                let self = this;
                request
                    .post(this.res_config.api_url.list.url)
                    .type('form')
                    .send(send)
                    .end(function(err, res){
                        var rs = res.text;
                        var rs_json = eval('(' + rs + ')');
                        if(rs_json && rs_json.status){
                            self.tableLoading = false;
                            self.tableData = rs_json.data;
                            //设置总数
                            self.tableCount = rs_json.data.count;
                        }
                    });//结束
            },
            handleSizeChange(val) {
                this.currentPage = 1;
                this.length = val;
                this.start = this.length * (this.currentPage - 1);
                this.initTable();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.start = this.length * (this.currentPage - 1);
                this.initTable();
            },
            handleSelectionChange(val) {
                //table选择事件
                this.multipleSelection = val;
            },
            handleOperation(key) {
                if(key == 'add'){
                    this.formValue = {};
                    //alert(key);
                    //预设model参数
                    if(this.res_config.add){
                        for(var key in this.res_config.add){
                            this.formValue[key] = '';
                        }
                    }
                    this.dialogFormTitle = "添加";
                    this.dialogFormConfig = this.res_config.add;
                    this.dialogFormVisible = true;
                }
                if(key == 'import'){
                    this.formBatch = '';
                    this.dialogFormBatch = true;
                }
                if(key == 'refresh'){
                    this.tableLoading = true;
                    this.initTable();
                }
                if(key == 'delete'){
                    this.handleDelete();
                }
                if(key == 'batchSearch'){
                    this.dialogSearchBatch = true;
                }
                if(key == 'search'){
                    if(this.conditionsVisible == true){
                        this.conditionsVisible = false;
                    } else {
                        this.conditionsVisible = true;
                    }
                }
                if(key == 'showField'){
                    if(this.setColumnVisible == true){
                        this.setColumnVisible = false;
                    } else {
                        this.setColumnVisible = true;
                    }
                }
            },
            handleEdit(index, row) {
                //编辑
                this.formValue = {};
                console.log(index, row);
                let self = this;
                request
                    .post(this.res_config.api_url.info)
                    .type('form')
                    .send({id: row.id})
                    .end(function(err, res){
                        if(res.body.status && res.body.status){
                            console.log(res.body.data);
                            self.dialogFormTitle = "编辑";
                            self.dialogFormConfig = self.res_config.edit;
                            self.formValue = res.body.data;
                            self.dialogFormVisible = true;
                        } else {
                            self.$message({
                                message: res.body.msg,
                                type: 'error'
                            });
                        }
                    });//结束
            },
            handleSave() {
                console.log(this.formValue);
                let self = this;
                request
                    .post(this.res_config.api_url.add)
                    .type('form')
                    .send(this.formValue)
                    .end(function(err, res){
                        if(res.body.status && res.body.status){
                            self.$message({
                                message: '保存成功',
                                type: 'success'
                            });
                        } else {
                            self.$message({
                                message: res.body.msg,
                                type: 'error'
                            });
                        }
                        self.dialogFormVisible = false;
                        self.initTable();
                    });//结束
            },
            handleBatch() {
                if(this.formBatch == ''){
                    this.$message({
                        message: '请输入导入信息',
                        type: 'warning'
                    });
                    return;
                }
                let self = this;
                request
                    .post(this.res_config.api_url.batch)
                    .type('form')
                    .send({value: this.formBatch})
                    .end(function(err, res){
                        if(res.body.status && res.body.status){
                            self.$message({
                                message: '导入成功',
                                type: 'success'
                            });
                        } else {
                            self.$message({
                                message: res.body.msg,
                                type: 'error'
                            });
                        }
                        self.dialogFormBatch = false;
                        self.initTable();
                    });//结束
            },
            handleDelete() {
                if(this.multipleSelection.length == 0){
                    this.$message({
                        message: '请选择删除的信息',
                        type: 'warning'
                    });
                    return;
                }
                let self = this;
                request
                    .post(this.res_config.api_url.delete)
                    .type('form')
                    .send(this.formValue)
                    .end(function(err, res){
                        if(res.body.status && res.body.status){
                            self.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                        } else {
                            self.$message({
                                message: res.body.msg,
                                type: 'error'
                            });
                        }
                        self.initTable();
                    });//结束
            },
            handleSearchBatch() {
                if(this.conditions.batch_query == ''){
                    this.$message({
                        message: '请输入查询信息',
                        type: 'warning'
                    });
                    return;
                }
                this.dialogSearchBatch = false;
                this.initTable();
            },
            handleSearch() {
                //高级查询
                //格式化参数，添加搜索类型
                for(var key in this.conditionsValue){
                    if(this.res_config.query.items[key] && this.res_config.query.items[key].cond != ''){
                        if(this.res_config.query.items[key].cond == 'like'){
                            this.conditions[key] = {like: this.conditionsValue[key]};
                        }
                    }
                }
                this.initTable();
            },
            handleSearchDel() {
                //高级搜索清除条件
                for(var key in this.conditionsValue){alert(this.conditionsValue[key]);
                    this.conditionsValue[key] = '';
                }
            },
            handleColumnAll(key, text) {
                //显示字段全选
                var isCheck = (this.setColumnCheckList.indexOf(text) > -1)?true:false;
                for(var key_column in this.res_config.set_column[key].column){
                    var text_column = this.res_config.columns_config[this.res_config.set_column[key].column[key_column]];
                    if(isCheck){
                        if(this.setColumnCheckList.indexOf(text_column) == -1){
                            this.setColumnCheckList.push(text_column);
                        }
                    } else {
                        this.arrayRemove(this.setColumnCheckList, text_column);
                    }
                }
                //
                this.res_config.default_columns = [];
                for(var key_column_check in this.setColumnCheckList){
                    for(var key_column_config in this.res_config.columns_config){
                        if(this.setColumnCheckList[key_column_check] == this.res_config.columns_config[key_column_config]){
                            this.res_config.default_columns.push(key_column_config);
                        }
                    }
                }
                this.initTable();
            },
            handleColumnOne() {
                this.res_config.default_columns = [];
                for(var key_column_check in this.setColumnCheckList){
                    for(var key_column_config in this.res_config.columns_config){
                        if(this.setColumnCheckList[key_column_check] == this.res_config.columns_config[key_column_config]){
                            this.res_config.default_columns.push(key_column_config);
                        }
                    }
                }
                this.initTable();
            },
            arrayRemove(array, value) {
                var index = array.indexOf(value);
                if (index > -1) {
                    array.splice(index, 1);
                }
            }
        }    
    }
</script>

<style scoped>
    section {
        padding: 20px;
    }
    /*.res {
        padding: 20px;
    }*/
    .toolbar {
        border: 1px solid #eaeefb;
        padding: 10px;
    }
    .el-row {
        margin-bottom: 20px;
        &:last-child {
            margin-bottom: 0;
        }
    }
    .el-col {
        border-radius: 4px;
        margin: 10px 5px 10px 0px;
    }
    .el-breadcrumb {
        margin-bottom: 20px;
    }
    .el-table th {
        text-align: center;
    }
    .el-form-item {
        margin-bottom: 0px;
    }
    .left {
        text-align: left;
    }
    .center {
        text-align: center;
    }
    .right {
        text-align: right;
    }
    .padding-bottom-10 {
        padding-bottom: 10px;
    }
    .margin-right-15 {
        margin-right: 15px;
    }
    .float-right {
        float: right;
    }
    .font-size-12 {
        font-size: 12px;  
    }
    .font-weight-bold {
        font-weight:bold;
    }
</style>