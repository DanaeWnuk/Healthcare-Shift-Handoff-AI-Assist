import {useState} from 'react'
import {View, Text, TextInput, Button} from 'react-native'
import {supabase} from '../supabaseClient'

export default function Index() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState<any>(null)

    const signIn = async () => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) console.log(error)
        else setUser(data.user)
    }

    return (
        <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
            {user ? (
                <Text>Welcome {user.email}</Text>
            ) : (
                <>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={{borderWidth: 1, marginBottom: 8, padding: 8}}
                    />
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{borderWidth: 1, marginBottom: 8, padding: 8}}
                    />
                    <Button title="Sign In" onPress={signIn}/>
                </>
            )}
        </View>
    )
}
