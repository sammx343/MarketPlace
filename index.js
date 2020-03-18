import React, { Component } from 'react';
import { Platform, ActivityIndicator, Alert, Linking, Dimensions, LayoutAnimation, Text, View, StatusBar, StyleSheet, TouchableOpacity,TouchableNativeFeedback,TouchableHighlight, Button, Image, TextInput, KeyboardAvoidingView, BackHandler, SectionList, FlatList,ScrollView, RefreshControl} from 'react-native';
import { List, ListItem, SearchBar } from 'react-native-elements';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; // Version can be specified in package.json
import Moment from 'moment';
import FloatingLabel from 'react-native-floating-labels';
import Toast, {DURATION} from 'react-native-easy-toast'

class LoginScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    username: 'cervantesac@uninorte.edu.co',
    password: '11111111',
    isLoading: false
  };
  _login = () => {
    this.setState({isLoading: true});
    return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/loginApp',{
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'username': 'appStaffMovil',
          'password': 'appStaffMovil'
        },  
      })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.status == "200"){
          this._loginUser(responseJson.content);  
        }else{
          console.log("app mal autenticada");
          this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000);
        }
        this.setState({isLoading: false});
      })
      .then(() => {})
      .catch((error) =>{
        this.setState({isLoading: false});
        console.error(error);
      });


    /*this.props.navigation.dispatch(StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Event' })
      ],
    }))*/
  };
  _loginUser = async (responseJson) => {
    this.setState({
      status: "200",
      tokenApp: responseJson.token,
    });
    const responseData = await fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/login',{
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'username': this.state.username,
        'password': this.state.password,
        'token': responseJson.token
      },  
    });
    const responseJsonData = await responseData.json();
    if(responseJsonData.content == "true"){
      //console.log("ok");
      this.props.navigation.dispatch(StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'Event', 
            params:{
              'tokenApp': this.state.tokenApp,
              'username': this.state.username,
              'password': this.state.password,
            }
          }),
        ]
      }));
    }else{
      console.log("usuario mal autenticado");
      this.refs.toast.show('No pudo acceder. Por favor verifique la conexión de red y/o el nombre de usuario y contraseña',2000);
    }
  };
  render() {
    return (
      <KeyboardAvoidingView 
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center',paddingBottom: 50,'backgroundColor': '#FFF'}}
        behavior="padding"
        >
        <Image source={require('./assets/icon.png')} style={styles.logo} />
        <FloatingLabel 
          labelStyle={styles.labelInput}
          inputStyle={styles.input}
          onChangeText={(value) => this.setState({username: value.toLowerCase().trim()})}
          style={styles.formInput}>
          Usuario
        </FloatingLabel>
        <FloatingLabel 
          labelStyle={styles.labelInput}
          inputStyle={styles.input}
          onChangeText={(value) => this.setState({password: value})}
          style={styles.formInput}
          secureTextEntry={true}>
          Contraseña
        </FloatingLabel>
        {Platform.OS === 'ios'?
          <TouchableHighlight 
            underlayColor= '#00826C'
            style={styles.bottomButton} 
            onPress={this._login}>
            <Text numberOfLines={1} style={styles.txtButton}>
              Entrar
            </Text>
          </TouchableHighlight> : 
          <TouchableNativeFeedback 
            background={TouchableNativeFeedback.Ripple('#00826C',false)}
            onPress={this._login}>
            <View style={styles.bottomButton} >
              <Text numberOfLines={1} style={styles.txtButton}>
                Entrar
              </Text>
            </View>
          </TouchableNativeFeedback>
        }
        <Toast ref="toast"
          style={{marginLeft:20,marginRight:20,padding:10}}
          position='bottom'
          opacity={0.8}
        />
        {this.state.isLoading &&
            <ActivityIndicator style={styles.activityIndicator}/>
        }
      </KeyboardAvoidingView>
    );
  }  
}

class EventScreen extends React.Component { 
  constructor(props){
    super(props);
    const { navigation } = this.props;
    const tokenApp = navigation.getParam('tokenApp', 0);
    const username = navigation.getParam('username', 0);
    const password = navigation.getParam('password', 0);
    this.state ={ 
                  isLoading: true,
                  refreshing: false,
                  tokenApp: tokenApp,
                  username: username,
                  password: password
                }
  }

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Eventos',
      headerRight: (
        <TouchableOpacity 
          onPress={() => {
            navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Login' })
              ],
            }))
          }}>
          <Image source={require('./assets/exit.png')} style={{width: 32,height: 32,marginRight:10}} />
         </TouchableOpacity>
      ),
    };
  };

  _onRefresh = () => {
    if(!this.state.refreshing){
      this.setState({refreshing: true});
      return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/services',{
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'username': this.state.username,
                'password': this.state.password,
                'token': this.state.tokenApp
              },  
            })
        .then((response) => response.json())
        .then((responseJson) => {
          if(responseJson.status == "200"){
            this._fetchData(responseJson.content);
          }else{
            this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000);
          }
        })
        .then(() => {})
        .catch((error) =>{
          console.error(error);
        });
    }
  };
  /*_fetchData = (responseJson) => {
    responseJson.sort(function (a, b) {
        return a.start_date.localeCompare(b.start_date);
    });
    if(responseJson.length > 1){
     var monthName = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      dataArray = [];
      for (var i = 0; i < responseJson.length; i++){
        lastStartDate = responseJson[i].start_date;
        lastStartDateArray = lastStartDate.split("-");
        lastEndDate = responseJson[i].end_date;
        lastEndDateArray = lastEndDate.split("-");
        dataArray[i] = {'key':responseJson[i].event_id,'name':responseJson[i].name,'start_date':lastStartDateArray[2] + ' ' + monthName[parseInt(lastStartDateArray[1]) - 1],'end_date':lastEndDateArray[2] + ' ' + monthName[parseInt(lastEndDateArray[1]) - 1]};
      }
    }
    this.setState({
      isLoading: false,
      dataSource: dataArray,
    }, function(){

    });
  };*/
  _fetchData = (responseJson) => {
    dataArray = [];
    responseJson.sort(function (a, b) {
      var initialDate1 = a.initialDate.split(' ')[1].split(',')[0] + ' ' + a.initialDate.split(' ')[0] + ' ' + a.initialDate.split(' ')[2];
      var initialDate2 = b.initialDate.split(' ')[1].split(',')[0] + ' ' + b.initialDate.split(' ')[0] + ' ' + b.initialDate.split(' ')[2];
      return initialDate1.localeCompare(initialDate2);
    });
    if(responseJson.length > 0){
     var monthName = {Jan:'Ene',
                      Feb:'Feb',
                      Mar:'Mar',
                      Apr:'Abr',
                      May:'May',
                      Jun:'Jun',
                      Jul:'Jul',
                      Aug:'Ago',
                      Sep:'Sep',
                      Oct:'Oct',
                      Nov:'Nov',
                      Dec:'Dic'};     
      for (var i = 0; i < responseJson.length; i++){
        lastStartDate = responseJson[i].initialDate;
        start_date = lastStartDate.split(' ')[1].split(',')[0] + ' ' + monthName[lastStartDate.split(' ')[0]];
        //console.log(start_date);
        lastEndDate = responseJson[i].finalDate;
        end_date = lastEndDate.split(' ')[1].split(',')[0] + ' ' + monthName[lastEndDate.split(' ')[0]];
        dataArray[i] = {'key':responseJson[i].id + '','name':responseJson[i].name,'start_date':start_date,'end_date':end_date};
      }
    }
    this.setState({
      isLoading: false,
      dataSource: dataArray,
      refreshing: false
    }, function(){

    });
  };
  componentDidMount(){
   return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/services',{
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.status == "200"){
          this._fetchData(responseJson.content);
        }else{
          this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000, () => {
            this.setState({
              isLoading: false,
            });
          });
        }
      })
      .catch((error) =>{
        console.error(error);
      });
  }
  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20,justifyContent: 'center','backgroundColor': '#FFF'}}>
          <ActivityIndicator/>
          <Toast ref="toast"
            style={{marginLeft:20,marginRight:20,padding:10}}
            position='bottom'
            positionValue = {170}
            opacity={0.8}
          />
        </View>
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'center','backgroundColor': '#FFF'}}>
        <FlatList style={{ alignSelf: 'stretch','position':'relative','marginTop':-1}}
          data={this.state.dataSource}  
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          renderItem={({item}) =>
                    <TouchableHighlight 
                      underlayColor= '#E6E6E6'
                      onPress={() => {
                        this.props.navigation.navigate('Activity',{
                          eventId: item.key,
                          eventName: item.name,
                          'tokenApp': this.state.tokenApp,
                          'username': this.state.username,
                          'password': this.state.password,
                        })
                      }}>
                      <View style={styles.eventListItem}>
                        <Text style={styles.eventListTitle}>{item.name}</Text>
                        <Text style={styles.eventListDesc}>{item.start_date} - {item.end_date}</Text>
                      </View>
                    </TouchableHighlight>
                  }
        />
        <Toast ref="toast"
          style={{marginLeft:20,marginRight:20,padding:10}}
          position='bottom'
          opacity={0.8}
        />
      </View>
    );
  }  
}

class ActivityScreen extends React.Component {
  constructor(props){
    super(props);
    const { navigation } = this.props;
    const tokenApp = navigation.getParam('tokenApp', 0);
    const username = navigation.getParam('username', 0);
    const password = navigation.getParam('password', 0);
    const eventId = navigation.getParam('eventId', 0);
    this.state ={ 
                  isLoading: true,
                  refreshing: false,
                  tokenApp: tokenApp,
                  username: username,
                  password: password,
                  eventId: eventId
                }
  }
  static navigationOptions = ({ navigation}) => {
    const eventName = navigation.getParam('eventName', 0);
    return {
      title: eventName,
      headerRight: (
        <TouchableOpacity 
          onPress={() => {
            navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Login' })
              ],
            }))
          }}>
          <Image source={require('./assets/exit.png')} style={{width: 32,height: 32,marginRight:10}} />
         </TouchableOpacity>
      ),
    };
  };
  _onRefresh = () => {
    if(!this.state.refreshing){
      this.setState({refreshing: true});
      return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/days?serviceId=' + this.state.eventId,{
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'username': this.state.username,
                'password': this.state.password,
                'token': this.state.tokenApp
              },  
            })
        .then((response) => response.json())
        .then((responseJson) => {
          if(responseJson.status == "200"){
            this._fetchData(responseJson.content);
          }else{
            this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000, () => {
              this.setState({
                isLoading: false,
              });
            });
          }
        })
        .then(() => {

        })
        .catch((error) =>{
          this.setState({refreshing: false});
          console.error(error);
        });
      }
  };
  /*_fetchData = (responseJson) => {
    responseJson.sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });
    if(responseJson.length > 1){
      var weekday = new Array(7);
      weekday[0] =  "Dom";
      weekday[1] = "Lun";
      weekday[2] = "Mar";
      weekday[3] = "Mie";
      weekday[4] = "Jue";
      weekday[5] = "Vie";
      weekday[6] = "Sab";

      var monthName = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
      dataArray = [];
      lastDate = responseJson[0].date;
      dt = lastDate + 'T00:00:01';
      lastDateArray = lastDate.split("-");
      day = parseInt(Moment(dt).format('e'));
      sectionArray = [{'day':weekday[day],'number':lastDateArray[2],'month':monthName[parseInt(lastDateArray[1]) - 1],'data':[{'key':responseJson[0].id,'name':responseJson[0].name,'place':responseJson[0].place,'hour':responseJson[0].hour}]}];
      index = 0;
      dataIndex = 1;
      for (var i = 1; i < responseJson.length; i++){
        var item = responseJson[i];    
        if(lastDate != item.date){
          lastDate = item.date;
          dt = lastDate + 'T00:00:01';
          day = parseInt(Moment(dt).format('e'));
          lastDateArray = lastDate.split("-");
          index++;
          sectionArray[index] = {'day':weekday[day],'number':lastDateArray[2],'month':monthName[parseInt(lastDateArray[1]) - 1],'data':[{'key':item.id,'name':item.name,'place':item.place,'hour':item.hour}]};    
          dataIndex = 1;         
        }else{
          sectionArray[index].data[dataIndex] = {'key':item.id,'name':item.name,'place':item.place,'hour':item.hour};
          dataIndex++;
        }
      }
    }
    this.setState({
      isLoading: false,
      dataSource: sectionArray,
    }, function(){

    });
  };*/
  _fetchData = async (responseJson) => {
    sectionArray = [];
    responseJson.sort(function (a, b) {
      var date1 = a.date.split(' ')[1].split(',')[0] + ' ' + a.date.split(' ')[0] + ' ' + a.date.split(' ')[2];
      var date2 = b.date.split(' ')[1].split(',')[0] + ' ' + b.date.split(' ')[0] + ' ' + b.date.split(' ')[2];
      return date1.localeCompare(date2);
    });
    if(responseJson.length > 0){
      var weekday = new Array(7);
      weekday[0] =  "Dom";
      weekday[1] = "Lun";
      weekday[2] = "Mar";
      weekday[3] = "Mie";
      weekday[4] = "Jue";
      weekday[5] = "Vie";
      weekday[6] = "Sab";

      var monthName = {Jan:'Ene',
                      Feb:'Feb',
                      Mar:'Mar',
                      Apr:'Abr',
                      May:'May',
                      Jun:'Jun',
                      Jul:'Jul',
                      Aug:'Ago',
                      Sep:'Sep',
                      Oct:'Oct',
                      Nov:'Nov',
                      Dec:'Dic'}; 
      dataArray = [];
      index = 0;
      dataIndex = 0;
      /*responseJson[1] = JSON.parse(JSON.stringify( responseJson[0] ));
      responseJson[1].date = "Dec 14, 2018 12:00:00 AM";*/
      for (var i = 0; i < responseJson.length; i++) {
        var item = responseJson[i];    
        date = item.date;
        dt = date.split(' ')[1].split(',')[0] + ' ' + date.split(' ')[0] + ' ' + date.split(' ')[2] + ' 00:00:01 -0500';
        day = parseInt(Moment(dt).format('e'));
        sectionArray[i] = {dayId:item.id, 'day':weekday[day],'number':date.split(' ')[1].split(',')[0],'month':monthName[date.split(' ')[0]],'data':[]};    
        const responseData = await fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/activities?dayId='+item.id,{
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          })
        const responseJsonData = await responseData.json();
        /*if(i == 0){
          responseJsonData.content[0].id = '1853';
          responseJsonData.content[1] = JSON.parse(JSON.stringify( responseJsonData.content[0] ));
          responseJsonData.content[2] = JSON.parse(JSON.stringify( responseJsonData.content[0] ));
          responseJsonData.content[1].id = '1851';
          responseJsonData.content[1].startDate = "Dec 13, 2018 2:00:00 AM";
          responseJsonData.content[1].nextActivityId = '1852';
          responseJsonData.content[2].id = '1854';
          responseJsonData.content[2].startDate = "Dec 13, 2018 3:00:00 AM";
          responseJsonData.content[2].nextActivityId = '1853';
          responseJsonData.content[3] = JSON.parse(JSON.stringify( responseJsonData.content[0] ));
          responseJsonData.content[4] = JSON.parse(JSON.stringify( responseJsonData.content[0] ));
          responseJsonData.content[3].id = '1850';
          responseJsonData.content[3].startDate = "Dec 13, 2018 4:00:00 AM";
          //responseJsonData.content[3].nextActivityId = '1853';
          responseJsonData.content[4].id = '1852';
          responseJsonData.content[4].startDate = "Dec 13, 2018 5:00:00 AM";
          //responseJsonData.content[4].nextActivityId = '1854';
        }*/
        stackArrayRelId = [];
        for (var j = 0; j < responseJsonData.content.length; j++){
          var dataArray = responseJsonData.content; 
          if("nextActivityId" in dataArray[j]){
            isFoundLater = false;
            for (var k = j + 1; k < dataArray.length; k++) {
              if(dataArray[j].nextActivityId == dataArray[k].id){
                dataArray.splice(j+1, 0, dataArray.splice(k, 1)[0]);
                isFoundLater = true;
                break;
              }
            }
            if(!isFoundLater){
              for (var k = 0; k < j; k++) {
                if(dataArray[j].nextActivityId == dataArray[k].id){
                  dataArray.splice(k, 0, dataArray.splice(j, 1)[0]);
                  break
                }
              }
            }
          }
        }
        for (var j = 0; j < responseJsonData.content.length; j++){
          var dataItem = responseJsonData.content[j];   
          initialHourArray = dataItem.startDate.split(' ')[3].split(":");
          initialHour = initialHourArray[0]+':'+initialHourArray[1] + ' ' + dataItem.startDate.split(' ')[4];
          endHourArray = dataItem.endDate.split(' ')[3].split(":");
          endHour = endHourArray[0]+':'+endHourArray[1] + ' ' + dataItem.endDate.split(' ')[4];
          related = 'no';
          if(stackArrayRelId.indexOf(dataItem.id) != -1){
            related = 'last';
          }  
          if("nextActivityId" in dataItem){
            related = 'first';
            stackArrayRelId.push(dataItem.nextActivityId);
            if(stackArrayRelId.indexOf(dataItem.id) != -1){
              related = 'middle';
            }  
          }
          sectionArray[i].data[j] = {'key':dataItem.id,'name':dataItem.name,'place':dataItem.place,'hour':initialHour + ' - ' + endHour,'description':dataItem.description,'isInformative':dataItem.isInformative,'related':related};
          
        }   
      }
      //console.log(sectionArray);
    }
    this.setState({
      isLoading: false,
      dataSource: sectionArray,
      refreshing: false
    }, function(){
      console.log("ok");
    });
  };
  componentDidMount(){
    const { navigation } = this.props;
    const itemId = navigation.getParam('eventId', 0);
    return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/days?serviceId=' + this.state.eventId,{
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          })
      .then((response) => response.json())
      .then((responseJson) => {
        if(responseJson.status == "200"){
          this._fetchData(responseJson.content);
        }else{
          this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000, () => {
            this.setState({
              isLoading: false,
            });
          });
        }
      })
      .catch((error) =>{
        console.error(error);
      });
  }
  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20,justifyContent: 'center','backgroundColor': '#FFF'}}>
          <ActivityIndicator/>
          <Toast ref="toast"
            style={{marginLeft:20,marginRight:20,padding:10}}
            position='bottom'
            positionValue = {170}
            opacity={0.8}
          />
        </View>
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center','backgroundColor': '#FFF' }}>
        <SectionList style={{ alignSelf: 'stretch','position':'relative','marginTop':-1}}
          sections={this.state.dataSource}  
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }  
          renderItem={({item}) =>
                    <TouchableOpacity 
                      onPress={() => {
                        this.props.navigation.navigate('ActivityDetail',{
                          tokenApp: this.state.tokenApp,
                          username: this.state.username,
                          password: this.state.password,
                          activityId: item.key,
                          activityName: item.name,
                          activityDescription: item.description,
                          activityPlace: item.place,
                          activityHour: item.hour,
                          activityIsInformative: item.isInformative
                        })
                      }}>
                      {item.related == 'first'
                        ?<View style={styles.activityListItemRelatedFirst}>
                          <Text style={styles.activityListItemName}>{item.name}</Text>
                          <Text style={styles.activityListItemDesc}>{item.place}</Text>
                          <Text style={styles.activityListItemDesc}>{item.hour}</Text>
                        </View>
                        :item.related == 'middle'
                          ?<View style={styles.activityListItemRelatedMiddle}>
                            <Text style={styles.activityListItemName}>{item.name}</Text>
                            <Text style={styles.activityListItemDesc}>{item.place}</Text>
                            <Text style={styles.activityListItemDesc}>{item.hour}</Text>
                          </View>
                          :item.related == 'last'
                            ?<View style={styles.activityListItemRelatedLast}>
                              <Text style={styles.activityListItemName}>{item.name}</Text>
                              <Text style={styles.activityListItemDesc}>{item.place}</Text>
                              <Text style={styles.activityListItemDesc}>{item.hour}</Text>
                            </View>
                            :<View style={styles.activityListItem}>
                              <Text style={styles.activityListItemName}>{item.name}</Text>
                              <Text style={styles.activityListItemDesc}>{item.place}</Text>
                              <Text style={styles.activityListItemDesc}>{item.hour}</Text>
                            </View>
                      }
                    </TouchableOpacity>
                  }
            renderSectionHeader={({section}) => 
                    <View>
                      <View style={styles.separator}></View>
                      <View style={styles.activityListHeader}>
                        <Text style={{paddingLeft:5,paddingRight: 5,fontSize:30,'color':'#018390'}}>{section.number}</Text>
                        <View style={{flexDirection:'column'}}>
                          <Text  style={{'color':'#018390'}}>{section.day}</Text>
                          <Text  style={{'color':'#018390'}}>{section.month}</Text>
                        </View>
                      </View>
                    </View>
                  }
        />
        <Toast ref="toast"
          style={{marginLeft:20,marginRight:20,padding:10}}
          position='bottom'
          opacity={0.8}
        />
      </View>
    );
  }  
}

class ActivityDetailScreen extends React.Component { 
  static navigationOptions = ({ navigation }) => {
    const activityName = navigation.getParam('activityName', 0);
    return {
      title: activityName,
      headerRight: (
        <TouchableOpacity 
          onPress={() => {
            navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Login' })
              ],
            }))
          }}>
          <Image source={require('./assets/exit.png')} style={{width: 32,height: 32,marginRight:10}} />
         </TouchableOpacity>
      ),
    };
  };

  constructor(props){
    super(props);
    const { navigation } = this.props;
    const tokenApp = navigation.getParam('tokenApp', 0);
    const username = navigation.getParam('username', 0);
    const password = navigation.getParam('password', 0);
    const activityId = navigation.getParam('activityId', 0);
    const activityName = navigation.getParam('activityName', 0);
    const activityDescription = navigation.getParam('activityDescription', 0);
    const activityPlace = navigation.getParam('activityPlace', 0);
    const activityHour = navigation.getParam('activityHour', 0);
    const activityIsInformative = navigation.getParam('activityIsInformative', 0);
    this.state ={ 
                  isLoading: true,
                  refreshing: false,
                  tokenApp: tokenApp,
                  username: username,
                  password: password,
                  activityId: activityId,
                  activityName: activityName,
                  activityDescription: activityDescription,
                  activityPlace: activityPlace,
                  activityHour: activityHour,
                  activityIsInformative: activityIsInformative
                }
  }
  /*_fetchData = (responseJson) => {
    for (var i = 0; i < responseJson[0].staff.length; i++) {
      responseJson[0].staff[i] = {'key':''+i,'name':responseJson[0].staff[i].name,'lastname':responseJson[0].staff[i].lastname};
    }
    const { navigation } = this.props;
    this.setState({
      isLoading: false,
      dataSource: responseJson[0].staff,
      desc: responseJson[0].desc,
      activityId: navigation.getParam('activityId', 0),
      activityName: navigation.getParam('activityName', 0),
      activityPlace: navigation.getParam('activityPlace', 0),
      activityHour: navigation.getParam('activityHour', 0)
    }, function(){

    });
  };*/
  _fetchData = (responseJson) => {
    for (var i = 0; i < responseJson.length; i++) {
      text = responseJson[i].name.toLowerCase().split(" ");
      name = '';
      for (var j = 0; j < text.length; j++) {
        name += text[j].slice(0,1).toUpperCase() + text[j].slice(1, text[j].length) + " ";
      }
      responseJson[i] = {'key':''+i,'name':name};
    }
    const { navigation } = this.props;
    this.setState({
      isLoading: false,
      dataSource: responseJson
    }, function(){

    });
  };
  componentDidMount(){
    return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/presenters?activityId='+this.state.activityId,{
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        if(responseJson.status == "200"){
          this._fetchData(responseJson.content);
        }else{
          this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000, () => {
            this.setState({
              isLoading: false,
            });
          });
        }
      })
      .catch((error) =>{
        console.error(error);
      });

  }
  render() {  
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20,justifyContent: 'center','backgroundColor': '#FFF'}}>
          <ActivityIndicator/>
          <Toast ref="toast"
            style={{marginLeft:20,marginRight:20,padding:10}}
            position='bottom'
            positionValue = {170}
            opacity={0.8}
          />
        </View>
      )
    }
    
    return (
      <View style={{flex: 1,justifyContent: 'center','backgroundColor': '#FFF'}}>
        <ScrollView>
          <View style={styles.activityDetailDesc}><Text style={{fontSize:18}}>{this.state.activityDescription}</Text><Text style={{position:'absolute',left: 20,bottom: 10,fontSize: 13,color:'#808080'}}>{this.state.activityPlace}</Text><Text style={{position:'absolute',right: 20,bottom: 10, fontSize: 13,color:'#808080'}}>{this.state.activityHour}</Text></View>
          {this.state.dataSource.length > 0 &&
            <View style={styles.activityDetailTitleContainer}><Text style={styles.activityDetailTitle}>Conferencistas</Text></View>
          }
          <FlatList style={{ alignSelf: 'stretch','position':'relative','marginTop':-1}}
            data={this.state.dataSource}  
            renderItem={({item}) =>
                      <View style={styles.eventListItem}>
                        <Text style={styles.conferencistListTitle}>{item.name}</Text>
                      </View>
                    }
          />
        </ScrollView>
        {!this.state.activityIsInformative &&
          <TouchableOpacity
            style={styles.buttonQr}
            onPress={() => {
              this.props.navigation.navigate('User',{
                tokenApp: this.state.tokenApp,
                username: this.state.username,
                password: this.state.password,
                activityId: this.state.activityId,
                activityName: this.state.activityName
              })
            }}>      
            <Image source={require('./assets/user.png')} style={styles.buttonQrImg} />
          </TouchableOpacity>
        }
        <Toast ref="toast2"
          style={{marginLeft:20,marginRight:20,padding:10}}
          position='bottom'
          opacity={0.8}
        />
      </View>
    );
  }  
}

class UserScreen extends React.Component {
  static navigationOptions = ({ navigation}) => {
    const activityName = navigation.getParam('activityName', 0);
    return {
      title: 'Inscritos',
      headerRight: (
        <TouchableOpacity 
          onPress={() => {
            navigation.dispatch(StackActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({ routeName: 'Login' })
              ],
            }))
          }}>
          <Image source={require('./assets/exit.png')} style={{width: 32,height: 32,marginRight:10}} />
         </TouchableOpacity>
      ),
    };
  };
  constructor(props){
    super(props);
    const { navigation } = this.props;
    const tokenApp = navigation.getParam('tokenApp', 0);
    const username = navigation.getParam('username', 0);
    const password = navigation.getParam('password', 0);
    const activityId = navigation.getParam('activityId', 0);
    this.state ={ 
                  isLoading: true,
                  refreshing: false,
                  tokenApp: tokenApp,
                  username: username,
                  password: password,
                  activityId: activityId
                }
    this.arrayholder = [];
  }
  _onRefresh = () => {
    if(!this.state.refreshing){
      this.setState({refreshing: true});
      return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/registeredPersons?activityId='+this.state.activityId,{
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'username': this.state.username,
                'password': this.state.password,
                'token': this.state.tokenApp
              },  
            })
        .then((response) => response.json())
        .then((responseJson) => {
          if(responseJson.status == "200"){
            responseJson.content.sort(function (a, b) {
              return a.name.localeCompare(b.name);
            });
            for (var i = 0; i < responseJson.content.length > 0; i++) {
              checked = 0;
              if("lastLogType" in responseJson.content[i]){
                if(responseJson.content[i].lastLogType == "CHECKIN"){
                  checked = 1;
                }else{
                  if(responseJson.content[i].lastLogType == "CHECKOUT"){
                    checked = 2;
                  }
                }
              }
              text = responseJson.content[i].name.toLowerCase().split(" ");
              name = '';
              for (var j = 0; j < text.length; j++) {
                name += text[j].slice(0,1).toUpperCase() + text[j].slice(1, text[j].length) + " ";
              }
              responseJson.content[i] = {'key':''+i,'registeredId': responseJson.content[i].id,'name':name,'checked':'' + checked};
            }
            this.arrayholder = responseJson.content;
            this.setState({
              isLoading: false,
              dataSource: responseJson.content,
              refreshing: false
            }, function(){

            });
          }else{
            this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000, () => {
              this.setState({
                isLoading: false,
                refreshing: false
              });
            });
          }
        })
        .then(() => {})
        .catch((error) =>{
          console.error(error);
        });
    }
  };
  _doCheckin = async (user) => {
    const response = await fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/checkIn?registeredId='+user.registeredId,{
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          });
    const responseJson = response.json();
    if(responseJson.content === "true"){
      return true;
    }
    return false;
  };
  _doCheckOut = async (user) => {
    const response = await fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/checkOut?registeredId='+user.registeredId,{
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          });
    const responseJson = response.json();

    if(responseJson.content === "true"){
      return true;
    }
    return false;
  };
  renderHeader = () => {    
    return (      
      <SearchBar        
        placeholder="Escribe aquí..."        
        containerStyle = {{'backgroundColor': '#FFF','borderBottomColor':'#018390'}}
        inputContainerStyle = {{'backgroundColor': '#E6E6E6','height': 50}}
        icon = {{'color': '#E6E6E6'}} 
        round        
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}             
      />    
    );  
  };
  searchFilterFunction = text => {    
    const newData = this.arrayholder.filter(item => {      
      //const itemData = `${item.lastname.toUpperCase()}${','}${item.name.toUpperCase()} ${'&'} ${item.lastname.toUpperCase()}${' '}${item.name.toUpperCase()}} ${'&'} ${item.name.toUpperCase()}${' '}${item.lastname.toUpperCase()}`;
      const itemData = `${item.name.toUpperCase()}`;
      const textData = text.toUpperCase();  
      return itemData.indexOf(textData) > -1;    
    });    
    this.setState({ dataSource: newData });  
  };
  componentDidMount(){
    const { navigation } = this.props;
    const itemId = navigation.getParam('eventId', 0);
    this._subscribe = this.props.navigation.addListener('didFocus', () => {
      return fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/registeredPersons?activityId='+this.state.activityId,{
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'username': this.state.username,
              'password': this.state.password,
              'token': this.state.tokenApp
            },  
          })
        .then((response) => response.json())
        .then((responseJson) => {
          if(responseJson.status == "200"){
            responseJson.content.sort(function (a, b) {
              return a.name.localeCompare(b.name);
            });
            for (var i = 0; i < responseJson.content.length; i++) {
              checked = 0;
              if("lastLogType" in responseJson.content[i]){
                if(responseJson.content[i].lastLogType == "CHECKIN"){
                  checked = 1;
                }else{
                  if(responseJson.content[i].lastLogType == "CHECKOUT"){
                    checked = 2;
                  }
                }
              }
              text = responseJson.content[i].name.toLowerCase().split(" ");
              name = '';
              for (var j = 0; j < text.length; j++) {
                name += text[j].slice(0,1).toUpperCase() + text[j].slice(1, text[j].length) + " ";
              }
              responseJson.content[i] = {'key':''+i,'registeredId': responseJson.content[i].id,'name':name,'checked':'' + checked};
            }
            this.arrayholder = responseJson.content;
            this.setState({
              isLoading: false,
              dataSource: responseJson.content,
              refreshing: false
            }, function(){

            });
          }else{
            this.refs.toast.show('No pudo acceder. Hubo un error de servidor por favor intente mas tarde',2000, () => {
              this.setState({
                isLoading: false,
                refreshing: false
              });
            });
          }
        })
        .catch((error) =>{
          console.error(error);
        });

      this.setState({refresh:true});
    });
  }
  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20,justifyContent: 'center','backgroundColor': '#FFF'}}>
          <ActivityIndicator/>
          <Toast ref="toast"
            style={{marginLeft:20,marginRight:20,padding:10}}
            position='bottom'
            positionValue = {170}
            opacity={0.8}
          />
        </View>
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center','backgroundColor': '#FFF' }}>
        <FlatList style={{ alignSelf: 'stretch','position':'relative','marginTop':-1}}
          data={this.state.dataSource} 
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          } 
          extraData={this.state.refresh}
          ListHeaderComponent={this.renderHeader}   
          renderItem={({item}) =>
                    <TouchableHighlight
                      underlayColor= '#E6E6E6'
                      onPress={() => {
                        if(item.checked === '1'){
                          Alert.alert(
                            'Un momento por favor...',
                            '¿Desea realizar una acción para el usuario '+item.name+'?',
                            [
                              {
                                text: 'Cancelar',
                                style: 'cancel', 
                                onPress: () => {}
                              },
                              { 
                                text: 'Check-out', 
                                style: 'destructive', 
                                onPress: () => {
                                  if(item.checked !== '2'){
                                    if(this._doCheckOut(item)){
                                      item.checked = '2';
                                    }
                                  }
                                  this.setState({refresh:true});
                                } 
                              },
                            ],
                            { cancellable: false }
                          );
                        }else{
                          if(item.checked === '2'){
                            Alert.alert(
                              'Un momento por favor...',
                              '¿Desea realizar una acción para el usuario '+item.name+'?',
                              [
                                {
                                  text: 'Cancelar',
                                  style: 'cancel', 
                                  onPress: () => {}
                                },
                                {
                                  text: 'Check-in',
                                  onPress: () => {
                                    if(item.checked !== '1'){
                                      if(this._doCheckin(item)){
                                        item.checked = '1';
                                      }
                                    }
                                    this.setState({refresh:true});
                                  },
                                },
                              ],
                              { cancellable: false }
                            );
                          }else{
                            Alert.alert(
                              'Un momento por favor...',
                              '¿Desea realizar una acción para el usuario '+item.name+'?',
                              [
                                {
                                  text: 'Cancelar',
                                  style: 'cancel', 
                                  onPress: () => {}
                                },
                                {
                                  text: 'Check-in',
                                  onPress: () => {
                                    if(item.checked !== '1'){
                                      if(this._doCheckin(item)){
                                        item.checked = '1';
                                      }
                                    }
                                    this.setState({refresh:true});
                                  },
                                },
                                { 
                                  text: 'Check-out', 
                                  style: 'destructive', 
                                  onPress: () => {
                                    if(item.checked !== '2'){
                                      if(this._doCheckOut(item)){
                                        item.checked = '2';
                                      }
                                    }
                                    this.setState({refresh:true});
                                  } 
                                },
                              ],
                              { cancellable: false }
                            );
                          }
                        }
                        
                        //this.props.navigation.navigate('Home',{eventId: item.key,eventName: item.name})
                      }}>
                      {item.checked === '1'
                        ?<View style={styles.userListItemChecked}>
                          <Text style={styles.userListItemName}>{item.name}</Text>
                        </View>
                        : item.checked === '2'
                          ?<View style={styles.userListItemCheckedOut}>
                            <Text style={styles.userListItemName}>{item.name}</Text>
                          </View>
                          :<View style={styles.userListItem}>
                            <Text style={styles.userListItemName}>{item.name}</Text>
                          </View>}
                      
                        
                    </TouchableHighlight>
                  }
        />
        <TouchableOpacity
          style={styles.buttonQr}
          onPress={() => {
            this.props.navigation.navigate('Scan',{
              tokenApp: this.state.tokenApp,
              username: this.state.username,
              password: this.state.password,
              activityId: this.state.activityId,
            })
          }}>      
          <Image source={require('./assets/qrreader.png')} style={styles.buttonQrImg} />
        </TouchableOpacity>
        <Toast ref="toast"
          style={{marginLeft:20,marginRight:20,padding:10}}
          position='bottom'
          opacity={0.8}
        />
      </View>
    );
  }  
}

class ScanScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props){
    super(props);
    const { navigation } = this.props;
    const tokenApp = navigation.getParam('tokenApp', 0);
    const username = navigation.getParam('username', 0);
    const password = navigation.getParam('password', 0);
    const activityId = navigation.getParam('activityId', 0);
    this.state ={ 
                  isLoading: true,
                  refreshing: false,
                  tokenApp: tokenApp,
                  username: username,
                  password: password,
                  activityId: activityId,
                  hasCameraPermission: null,
                  lastScannedUrl: null,
                }
  }
  componentDidMount() {
    this._requestCameraPermission();
  }

  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };

  _handleBarCodeRead = result => {
    if (result.data !== this.state.lastScannedUrl) {
      LayoutAnimation.spring();
      this.setState({ lastScannedUrl: result.data });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.hasCameraPermission === null
          ? <Text>Requesting for camera permission</Text>
          : this.state.hasCameraPermission === false
              ? <Text style={{ color: '#fff' }}>
                  Camera permission is not granted
                </Text>
              : <BarCodeScanner
                  onBarCodeRead={this._handleBarCodeRead}
                  style={[StyleSheet.absoluteFill, styles.container]}
                  >
                  <Text style={styles.description}>Escanea tu Código QR</Text>
                  <Text
                    onPress={() => this.props.navigation.goBack()}
                    style={styles.cancel}>
                    Cancelar
                  </Text>
                </BarCodeScanner>}

        {this._maybeRenderUrl()}

        <StatusBar hidden />
      </View>
    );
  }

  _handlePressCancel = () => {
    this.setState({ lastScannedUrl: null });
  };

  _maybeRenderUrl = () => {
    
    if (!this.state.lastScannedUrl) {
      return;
    }
    fetch('https://tananeoqa.uninorte.edu.co/marketplace/api/v1/checkInOut?activityId='+this.state.activityId+'&barCode='+this.state.lastScannedUrl,{
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'username': this.state.username,
          'password': this.state.password,
          'token': this.state.tokenApp
        },  
      })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.status == "200"){
        if(responseJson.content.success === true){
          Alert.alert(
            'Operación Exitosa',
            'Se realizó un ' + responseJson.content.regLogTypePerformed + ' correctamente',
            [
              {
                text: 'Continuar',
                onPress: () => {this.setState({ lastScannedUrl: null })},
              },
              {
                text: 'Salir',
                onPress: () => {this.props.navigation.goBack()} 
              },
            ],
            { cancellable: false,
              
            }
          );
        }else{
          Alert.alert(
            'Operación Fallida',
            'No se pudo realizar la Operación correctamente, por favor intentar nuevamente',
            [
              {
                text: 'Continuar',
                onPress: () => {this.setState({ lastScannedUrl: null })},
              },
              {
                text: 'Salir',
                onPress: () => {this.props.navigation.goBack()} 
              },
            ],
            { cancellable: false,
              
            }
          );
        }
      }else{
        Alert.alert(
          'Operación Fallida',
          'No se pudo realizar la Operación correctamente, por favor intentar nuevamente',
          [
            {
              text: 'Continuar',
              onPress: () => {this.setState({ lastScannedUrl: null })},
            },
            {
              text: 'Salir',
              onPress: () => {this.props.navigation.goBack()} 
            },
          ],
          { cancellable: false,
            
          }
        );
      }
    })
    .catch((error) =>{
      console.error(error);
    });
    return;
  };
}

const AppNavigator = createStackNavigator({
  Login: {
    screen: LoginScreen,
  },
  Event: {
    screen: EventScreen,
  },
  Activity: {
    screen: ActivityScreen,
  },
  ActivityDetail:{
    screen: ActivityDetailScreen,
  },
  User:{
    screen: UserScreen,
  },
  Scan: {
    screen: ScanScreen,
  },
}, {
    initialRouteName: 'Login',
    mode: 'modal',
    defaultNavigationOptions: {
      headerTitleStyle: {
        fontWeight: 'normal',
      },
      headerStyle: {
        //marginTop: 24,
        height: 70,
        borderBottomColor: '#018390',
        borderBottomWidth: 2
      },
    },
});

export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
  //Login
  activityIndicator:{
    position: 'absolute',
  },
  logo: {
    width: 144,
    height: 144,
    marginBottom: 50
  },
  labelInput: {
    color: '#018390',
  },
  formInput: {   
    alignSelf: 'stretch', 
    borderBottomWidth: 1, 
    marginLeft: 25,
    marginRight: 25,
    borderColor: '#018390',       
  },
  input: {
    borderWidth: 0,
    color: '#000',
  },
  bottomButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#004D40',
    padding: 10
  },
  txtButton: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center'
  },
  //Event
  eventListItem:{
    alignSelf: 'stretch',
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6',
    padding: 20,
    fontSize: 18,
    position: 'relative'
  },
  eventListTitle:{
    fontSize: 18,
  },
  conferencistListTitle:{
    fontSize: 18,
    textTransform: 'capitalize'
  },
  eventListDesc:{
    color: '#808080',
    fontSize: 18
  },
  //Activities
  activityListHeader:{
    color: '#018390',
    flexDirection: 'row',
    paddingTop: 20,
    position: 'absolute',
    left: 0,
    zIndex: 3
  },
  separator:{
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6',
    position: 'absolute',
    left: 0,
    right: 0,
    top: -1
  },
  
  activityListItem:{
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 80,
    paddingLeft: 20,
    marginRight: 10,
    fontSize: 18,
    zIndex: 2,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6'
  }, 
  activityListItemRelatedFirst:{
    backgroundColor: '#DAE8FC',
    alignSelf: 'stretch',
    marginTop: 5,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 80,
    paddingLeft: 20,
    marginRight: 10,
    fontSize: 18,
    zIndex: 2,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6'
  }, 
  activityListItemRelatedMiddle:{
    backgroundColor: '#DAE8FC',
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 80,
    paddingLeft: 20,
    marginRight: 10,
    fontSize: 18,
    zIndex: 2,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6'
  }, 
  activityListItemRelatedLast:{
    backgroundColor: '#DAE8FC',
    marginBottom: 5,
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 80,
    paddingLeft: 20,
    marginRight: 10,
    fontSize: 18,
    zIndex: 2,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6'
  }, 
  //ActivityDetails
  activityDetailDesc:{
    fontSize: 18,
    alignSelf: 'stretch',
    padding: 20,
    paddingBottom: 50,
    margin: 20,
    marginTop: 50,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 5,
  },
  activityDetailTitleContainer:{
    backgroundColor: '#FFF',
    alignSelf: 'stretch',
    borderBottomWidth: 2,
    borderBottomColor: '#018390',
  },
  activityDetailTitle:{
    alignSelf: 'stretch',
    color: '#004D40',
    fontSize: 20,
    padding: 20,
    marginTop: 20
  },
  //Users
  userListItem:{
    alignSelf: 'stretch',
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    fontSize: 18,
    zIndex: 2,
    position: 'relative'
  },
  userListItemName:{
    textTransform: 'capitalize'
  },
  userListItemChecked:{
    alignSelf: 'stretch',
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    fontSize: 18,
    zIndex: 2,
    position: 'relative',
    borderLeftWidth: 5,
    borderLeftColor: '#018390',
  },
  userListItemCheckedOut:{
    alignSelf: 'stretch',
    borderTopWidth: 2,
    borderTopColor: '#E6E6E6',
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    fontSize: 18,
    zIndex: 2,
    position: 'relative',
    borderLeftWidth: 5,
    borderLeftColor: '#EA6B66',
  },
  activityListItemName:{
    color: '#333',
    fontSize: 18,
    marginBottom: 5
  },
  activityListItemDesc: {
    color: '#808080',
    fontSize: 18,
    marginBottom: 5
  },
  buttonQr: {
    backgroundColor: '#018390',
    position: 'absolute',
    right: 20,
    bottom: 40,
    borderRadius: 32,
    width: 64,
    height: 64,
    padding: 10
  },
  buttonQrImg:{
    width: 44,
    height: 44
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    flexDirection: 'row'
  },
  url: {
    flex: 1
  },
  urlText: {
    color: '#fff',
    fontSize: 20
  },
  cancelButton: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18
  },
  description: {
    fontSize: 18,
    marginTop: '10%',
    textAlign: 'center',
    width: '70%',
    color: 'white',
  },
  cancel: {
    bottom: '10%',
    fontSize: 15,
    textAlign: 'center',
    width: '70%',
    color: 'white',
    position: 'absolute'
  },
});