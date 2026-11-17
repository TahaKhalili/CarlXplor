import { useSSO } from '@clerk/expo/experimental'
import { Pressable, StyleSheet, Text } from 'react-native'

export default function GoogleSignInButton() {
  const { startSSOFlow } = useSSO()

  const handlePress = async () => {
    try {
      const { createdSessionId } = await startSSOFlow({ strategy: 'oauth_google' })
      if (!createdSessionId) {
        console.log('Google sign-in did not create a session')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Pressable style={styles.button} onPress={handlePress}>
      <Text style={styles.label}>Sign in with Google</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
})
