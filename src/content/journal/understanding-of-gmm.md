---
title: 'My Understanding of GMMs'
description: 'How Gaussian Mixture Models turn overlapping bell curves into soft clusters, and how expectation maximization learns their weights, means, and covariances.'
date: 2026-11-19
tags: ['gaussian mixture models', 'expectation maximization', 'clustering']
issue: 1
cover: '/images/gmm-std.jpg'
coverAlt: 'A bell curve illustrating the mean and spread of a Gaussian distribution'
coverWidth: 1000
coverHeight: 548
---

When I started learning about Gaussian Mixture Models (GMMs), one of the things I wanted to understand was how a model could identify different groups within a dataset without having predefined labels.

## What is a Gaussian Mixture Model?

My understanding is that a Gaussian Mixture Model is a probabilistic clustering algorithm. It assumes that a dataset is made up of different underlying Gaussian distributions and tries to identify those distributions.

For example, imagine having a dataset containing people's annual income, spending scores, and purchase frequency. I could use GMM to identify different customer segments based on these features.

Some customers might have relatively high incomes and high spending scores, while others might have lower incomes but purchase more frequently.

The interesting part is that these characteristics can overlap. Someone might have a high income but a relatively low spending score. Another person might have a lower income but purchase frequently.

This is where I find GMM particularly interesting.

## The difference between K-Means and GMM

K-Means and GMM are both clustering algorithms, but they approach clustering differently.

K-Means uses hard clustering. This means that each observation is assigned to one particular cluster based on its distance from the cluster centroid.

GMM, on the other hand, uses soft clustering. Rather than immediately assigning an observation to one cluster, it calculates the probability of that observation belonging to each Gaussian component.

For example:

| Gaussian component | Probability |
| ------------------ | ----------- |
| Gaussian 1         | 75%         |
| Gaussian 2         | 20%         |
| Gaussian 3         | 5%          |

This means Gaussian 1 explains the observation more strongly, although the other two components still have some probability of explaining it.

I find this approach useful because data does not always fit neatly into separate groups. There can be overlaps, and forcing an observation into one cluster immediately might discard useful information.

## Understanding the Gaussian distribution

Before understanding GMM, I needed to understand what a Gaussian distribution actually represents.

A Gaussian distribution, commonly called a normal distribution, is a probability distribution that describes how values are distributed around a central point called the mean.

It is commonly represented using two parameters:

- Mean ($\mu$): The central position of the distribution.
- Variance ($\sigma^2$)): How spread out the values are around the mean.

### Mean

The mean is the average of the observations.

The formula is:

$$\mu = \frac{1}{N}\sum_{i=1}^{N}x_i $$

Where:

- $(\mu$) = mean.
- $(N$) = total number of observations.
- $(x_i$) = an individual observation.
- $(\sum$) = summation of all observations.

For example, if I have:

$$ X = [2,4,6,8,10] $$

Then:

$$ \mu = \frac{2+4+6+8+10}{5}=6 $$

The mean is 6.

**When is this formula used?**

This formula is used when calculating the average of a dataset or estimating the initial mean of a single Gaussian distribution.

However, when training a GMM, we eventually use a responsibility-weighted mean instead of the ordinary mean because observations contribute differently to each Gaussian component.

### Variance

Variance tells us how spread out observations are around their mean.

The population variance formula is:

$$ \sigma^2 = \frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2 $$

Where:

- $(\sigma^2$) = variance.
- $(N$) = number of observations.
- $(x_i$) = individual observation.
- $(\mu$) = mean.

Using our previous dataset:

$$ X=[2,4,6,8,10] $$

The mean is 6.

Therefore:

$$ \sigma^2 = \frac{(2-6)^2+(4-6)^2+(6-6)^2+ (8-6)^2+(10-6)^2}{5} $$

$$ \sigma^2 = \frac{40}{5}=8 $$

The variance is 8.

**When is this formula used?**

This formula is used when calculating the variance of an entire population or when estimating the initial spread of a dataset.

For sample variance, we normally divide by $(N-1$), but GMM's maximum-likelihood covariance estimation uses the population-style denominator, with responsibility weights.

### Standard deviation

Standard deviation is simply the square root of variance.

$$ \sigma = \sqrt{\sigma^2} $$

For our example:

$$ \sigma=\sqrt{8}\approx2.828 $$

Variance and standard deviation describe the same spread, but standard deviation is expressed in the original units of the data.

## Understanding covariance

This was one of the concepts I initially found confusing.

Variance measures the spread of one variable, while covariance measures how two variables change in relation to each other.

For example, suppose I have two variables:

- Annual income.
- Spending score.

I might want to understand whether people with higher incomes generally have higher spending scores.

The sample covariance formula is:

$$ \operatorname{Cov}(X,Y)= \frac{1}{N-1} \sum\_{i=1}^{N}(x_i-\bar{x})(y_i-\bar{y}) $$

Where:

- $(X$) and $(Y$) are two variables.
- $(x_i$) is an observation from X.
- $(y_i$) is an observation from Y.
- $(\bar{x}$) is the mean of X.
- $(\bar{y}$) is the mean of Y.

A positive covariance indicates that the variables tend to move in the same direction. A negative covariance indicates that they tend to move in opposite directions.

A covariance close to zero indicates little linear co-movement.

### What happens when we have multiple dimensions?

This is where the covariance matrix comes in.

Suppose I have three variables:

$$ X=[\text{Income},\text{Spending},\text{Frequency}] $$

The covariance matrix is:

$$ \Sigma = \begin{bmatrix} \sigma_{11} & \sigma_{12} & \sigma_{13} \sigma_{21} & \sigma_{22} & \sigma_{23} \sigma_{31} & \sigma_{32} & \sigma_{33} \end{bmatrix} $$

The diagonal contains the variances of individual features.

The other positions contain the covariances between pairs of features.

For example:

$$ \Sigma = \begin{bmatrix} 100 & 20 & 10 20 & 50 & -5 10 & -5 & 30 \end{bmatrix} $$

This is an illustrative covariance matrix.

The important thing is that the matrix allows us to understand not only the spread of individual variables but also how they relate to one another.

**When is covariance used instead of variance?**

- For one-dimensional data, covariance reduces to variance.
- For multidimensional data, covariance matrices describe the spread and relationships between features.
- In GMM, covariance matrices help determine the shape and orientation of each Gaussian distribution.

## Understanding the Gaussian probability density function

This was another important part of my learning process.

The Gaussian probability density function (PDF) calculates the density of a particular observation under a Gaussian distribution.

For one-dimensional data, the formula is:

$$ \mathcal{N}(x|\mu,\sigma^2)= \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left( -\frac{(x-\mu)^2}{2\sigma^2} \right) $$

Where:

- $(x$) = the observation.
- $(\mu$) = mean.
- $(\sigma^2$) = variance.
- $(\pi$) = mathematical constant.
- $(\exp$) = exponential function.

The formula calculates how dense the distribution is around a particular observation.

An important distinction is that the PDF is not directly the probability of an exact continuous value. It is a density. Probabilities are obtained by integrating the density over an interval.

### What happens with multidimensional data?

When we have multiple features, we use the multivariate Gaussian PDF.

The formula becomes:

$$ \mathcal{N}(x|\mu,\Sigma)= \frac{1}{ \sqrt{(2\pi)^D|\Sigma|} } \exp\left( -\frac{1}{2} (x-\mu)^T\Sigma^{-1}(x-\mu) \right) $$

Where:

- $(x$) = observation vector.
- $(\mu$) = mean vector.
- $(\Sigma$) = covariance matrix.
- $(D$) = number of features.
- $(|\Sigma|$) = determinant of the covariance matrix.
- $(\Sigma^{-1}$) = inverse of the covariance matrix.
- $(T$) = transpose.

The important difference is that we now use a covariance matrix instead of a single variance value.

**When is each formula used?**

| Formula                   | When to use                               |
| ------------------------- | ----------------------------------------- |
| 1D Gaussian PDF           | When an observation has one feature       |
| Multivariate Gaussian PDF | When an observation has multiple features |

We don't need to write a different formula for 2D, 3D, 4D, or 5D data. The multivariate formula handles all of them.

## Understanding the Gaussian Mixture Model formula

Now that I understand Gaussian distributions, I can understand how GMM combines multiple Gaussian distributions.

The overall mixture density is:

$$ p(x)=\sum\_{k=1}^{K} \pi_k\mathcal{N}(x|\mu_k,\Sigma_k) $$

Where:

- $(p(x)$) = overall probability density of observation x.
- $(K$) = number of Gaussian components.
- $(\pi_k$) = mixture weight of component k.
- $(\mu_k$) = mean of component k.
- $(\Sigma_k$) = covariance matrix of component k.
- $(\mathcal{N}$) = Gaussian probability density function.

The summation means that we calculate the weighted density from each Gaussian and add them together.

### Understanding mixture weights

Mixture weights determine the relative contribution of each Gaussian component to the overall distribution.

The weights must satisfy:

$$ \sum\_{k=1}^{K}\pi_k=1 $$

And:

$$ \pi_k\geq0 $$

For example:

$$ \pi=[0.4,0.35,0.25] $$

This means that the three Gaussian components have mixture weights of 40%, 35%, and 25%.

These weights are not necessarily fixed. During training, the model updates them using the responsibilities.

**When is this formula used?**

The mixture density formula is used when we want to calculate the overall density of an observation under the entire GMM.

It is not the formula we use directly to determine the most likely cluster. For that, we calculate posterior probabilities.

## Understanding the Expectation-Maximization algorithm

One of the most important things I learned about GMM is that it uses an algorithm called Expectation-Maximization (EM) to estimate its parameters.

EM consists of two major steps: the E-step and the M-step.

### The E-step (Expectation step)

The E-step calculates the responsibilities of each Gaussian component for every observation.

The formula is:

$$ r\_{ik}= \frac{ \pi_k\mathcal{N}(x_i|\mu_k,\Sigma_k) }{ \sum\_{j=1}^{K} \pi_j\mathcal{N}(x_i|\mu_j,\Sigma_j) } $$

Where:

- $(r\_{ik}$) = responsibility of component k for observation i.
- $(\pi_k$) = mixture weight of component k.
- $(\mathcal{N}(x_i|\mu_k,\Sigma_k)$) = density of observation i under component k.
- $(K$) = number of components.

The numerator calculates the weighted density for one Gaussian component.

The denominator calculates the total weighted density across all Gaussian components.

We divide the numerator by the denominator to normalize the result.

For example, suppose the weighted densities are:

$$ [0.16,0.10,0.18] $$

The total is:

$$ 0.16+0.10+0.18=0.44 $$

The responsibilities become:

$$ r=[0.3636,0.2273,0.4091] $$

The probabilities add up to 1.

This means Gaussian 3 has the highest responsibility for that observation.

**When is this formula used?**

It is used during the E-step to calculate the responsibility matrix.

It is not used to update the means or covariance matrices directly. Those updates happen in the M-step using the responsibilities calculated here.

### The M-step (Maximization step)

The M-step uses the responsibilities calculated in the E-step to update the parameters of the Gaussian distributions.

There are three major updates.

**A. Calculate effective component counts**

$$ N_k=\sum\_{i=1}^{N}r\_{ik} $$

Where:

- $(N_k$) = effective number of observations associated with component k.
- $(r\_{ik}$) = responsibility of component k for observation i.
- $(N$) = total number of observations.

This formula adds the responsibilities for one component across all observations.

For example, if the sum of responsibilities for Gaussian 1 is 400, its effective count is 400.

This is not necessarily 400 distinct observations exclusively assigned to it. It is the sum of their fractional responsibilities.

**When is this formula used?**

It is used during the M-step as a normalization value for updating the weights, means, and covariances.

**B. Update the mixture weights**

$$ \pi_k=\frac{N_k}{N} $$

Where:

- $(\pi_k$) = updated mixture weight.
- $(N_k$) = effective component count.
- $(N$) = total number of observations.

Suppose I have 1,000 observations and the effective counts are:

| Gaussian   | Effective count |
| ---------- | --------------- |
| Gaussian 1 | 400             |
| Gaussian 2 | 350             |
| Gaussian 3 | 250             |

Then:

$$ \pi_1=\frac{400}{1000}=0.40 $$

$$ \pi_2=\frac{350}{1000}=0.35 $$

$$ \pi_3=\frac{250}{1000}=0.25 $$

The updated weights are:

$$ \pi=[0.40,0.35,0.25] $$

This tells me the relative contribution of each Gaussian component to the dataset.

**C. Update the means**

The responsibility-weighted mean formula is:

$$ \mu_k= \frac{1}{N_k} \sum\_{i=1}^{N}r\_{ik}x_i $$

Where:

- $(\mu_k$) = updated mean of component k.
- $(N_k$) = effective component count.
- $(r\_{ik}$) = responsibility.
- $(x_i$) = observation.

Unlike the ordinary mean, this formula considers how strongly each observation is associated with a particular Gaussian.

For example, if an observation has a responsibility of 0.9 for Gaussian 1, it contributes more to Gaussian 1's mean than an observation with a responsibility of 0.1.

**When is this formula used?**

It is used during the M-step to update the center of each Gaussian distribution.

We use the ordinary mean for a simple unweighted average, but we use this weighted formula when training GMM.

**D. Update the covariance matrices**

The covariance update formula is:

$$ \Sigma_k= \frac{1}{N_k} \sum\_{i=1}^{N} r\_{ik}(x_i-\mu_k)(x_i-\mu_k)^T $$

Where:

- $(\Sigma_k$) = updated covariance matrix.
- $(N_k$) = effective component count.
- $(r\_{ik}$) = responsibility.
- $(x_i$) = observation vector.
- $(\mu_k$) = updated mean vector.
- $(T$) = transpose.

This formula calculates the responsibility-weighted spread of observations around the updated mean.

For one-dimensional data, the covariance update reduces to the responsibility-weighted variance:

$$ \sigma_k^2= \frac{1}{N_k} \sum\_{i=1}^{N}r\_{ik}(x_i-\mu_k)^2 $$

**When is each formula used?**

- The matrix formula is used for multidimensional observations.
- The scalar formula is used for one-dimensional observations.

Both represent the same mathematical operation, adapted to the dimensionality of the data.

### Covariance regularization

One thing I also learned while implementing GMM is that covariance matrices can become singular or nearly singular.

This can cause problems when calculating the inverse or determinant of a covariance matrix.

To help prevent this, we add a small regularization value to the diagonal:

$$ \Sigma_k^{regularized} = \Sigma_k+\lambda I $$

Where:

- $(\Sigma_k$) = original covariance matrix.
- $(\lambda$) = small regularization value.
- $(I$) = identity matrix.

For example:

```
reg_covar = 1e-6covariance += reg_covar * np.eye(n_features)
```

This helps keep the covariance matrix positive definite and makes the calculations more numerically stable.

It does not remove randomness from the model.

## Why do we repeat the E-step and M-step?

Initially, the parameters of the Gaussian distributions might not accurately represent the underlying data.

This is why we don't just perform the E-step and M-step once.

We repeat both steps because they depend on each other.

The E-step uses the current parameters to calculate responsibilities. The M-step then uses those responsibilities to update the parameters.

After updating the parameters, we return to the E-step and calculate new responsibilities using the updated values.

This process continues until the model converges or reaches a predefined maximum number of iterations.

### Understanding log-likelihood

One way to monitor the model's progress is by calculating log-likelihood.

The formula is:

$$ \mathcal{L}= \sum\_{i=1}^{N} \log\left( \sum\_{k=1}^{K} \pi_k\mathcal{N}(x_i|\mu_k,\Sigma_k) \right) $$

Where:

- $(\mathcal{L}$) = total log-likelihood.
- $(N$) = number of observations.
- $(K$) = number of Gaussian components.
- $(\pi_k$) = mixture weight.
- $(\mathcal{N}$) = Gaussian density.

The formula calculates how well the model explains the observed dataset under its current parameters.

During EM training, the log-likelihood should generally increase or remain unchanged.

We can compare the log-likelihood between iterations to determine whether the model is still improving.

For example:

$$ |\mathcal{L}\_{t}-\mathcal{L}\_{t-1}|<\epsilon $$

Where:

- $(\mathcal{L}\_t$) = current log-likelihood.
- $(\mathcal{L}\_{t-1}$) = previous log-likelihood.
- $(\epsilon$) = convergence tolerance.

If the difference becomes sufficiently small, we can stop training.

**When is this formula used?**

It is used to monitor convergence and assess the model's fit to the data.

It is not used to calculate the cluster membership probabilities directly. That is the responsibility formula.

## Understanding GMM predictions

Another thing I learned is that GMM can provide two different kinds of outputs depending on what I want.

### Predicting posterior probabilities

The posterior probability formula is:

$$ P(k|x)= \frac{ \pi_k\mathcal{N}(x|\mu_k,\Sigma_k) }{ \sum\_{j=1}^{K} \pi_j\mathcal{N}(x|\mu_j,\Sigma_j) } $$

This is the same mathematical formula used to calculate responsibilities during the E-step.

The difference is that during training, we calculate it for every training observation, whereas during prediction, we calculate it for a new observation.

For example:

```
[0.75, 0.20, 0.05]
```

This gives me the probability distribution across the three components.

In scikit-learn, the equivalent operation is:

```
model.predict_proba(X)
```

### Predicting the most likely cluster

If I want the cluster with the highest probability, I use:

$$ \hat{k}=\arg\max_k P(k|x) $$

The `argmax` operation returns the index of the component with the highest posterior probability.

For example:

```
probabilities = [0.75, 0.20, 0.05]cluster = np.argmax(probabilities)# Output: 0
```

This means the observation is assigned to Gaussian component 0.

In scikit-learn, the equivalent operation is:

```
model.predict(X)
```

An important distinction is that these indices are not predefined labels. GMM does not automatically know that cluster 0 represents high-income customers or cluster 1 represents frequent buyers. I have to interpret the clusters after examining their characteristics.

## Putting everything together

My understanding is that the entire GMM training process works as follows:

**1. Initialize parameters**

Generate initial weights, means, and covariance matrices.

**2. E-step**

Calculate responsibilities for every observation across all Gaussian components.

**3. M-step**

Update mixture weights, means, and covariance matrices using responsibilities.

**4. Evaluate convergence**

Calculate log-likelihood and check whether the model has converged.

**5. Repeat or finish**

If not converged, return to the E-step. Otherwise, finish training.

**6. Make predictions**

Return posterior probabilities or the most likely component index.

## Quick reference: All the important formulas

This is the section I would probably return to when revising GMM.

| Concept            | Formula                                                                       | Purpose                            |
| ------------------ | ----------------------------------------------------------------------------- | ---------------------------------- |
| Mean               | $(\mu=\frac{1}{N}\sum x_i$)                                                 | Ordinary average                   |
| Variance           | $(\sigma^2=\frac{1}{N}\sum(x_i-\mu)^2$)                                     | Spread of one variable             |
| Covariance         | $(\frac{1}{N-1}\sum(x_i-\bar{x})(y_i-\bar{y})$)                             | Relationship between two variables |
| Gaussian PDF       | $(\mathcal{N}(x\|\mu,\sigma^2)$)                                            | Density for 1D data                |
| Multivariate PDF   | $(\mathcal{N}(x\|\mu,\Sigma)$)                                              | Density for multidimensional data  |
| Mixture density    | $(p(x)=\sum_k\pi_k\mathcal{N}\_k(x)$)                                       | Overall mixture density            |
| Responsibility     | $(r\_{ik}=\frac{\pi_k\mathcal{N}\_k(x_i)}{\sum_j\pi_j\mathcal{N}\_j(x_i)}$) | Membership probability             |
| Effective count    | $(N_k=\sum_i r\_{ik}$)                                                      | Effective component membership     |
| Weight update      | $(\pi_k=N_k/N$)                                                             | Update mixture weights             |
| Mean update        | $(\mu_k=\frac{\sum_i r\_{ik}x_i}{N_k}$)                                     | Update Gaussian centers            |
| Covariance update  | $(\Sigma_k=\frac{\sum_i r\_{ik}(x_i-\mu_k)(x_i-\mu_k)^T}{N_k}$)             | Update Gaussian spread             |
| Regularization     | $(\Sigma_k+\lambda I$)                                                      | Improve numerical stability        |
| Log-likelihood     | $(\mathcal{L}=\sum_i\log p(x_i)$)                                           | Evaluate model fit                 |
| Cluster prediction | $(\hat{k}=\arg\max_k P(k\|x)$)                                              | Select most likely component       |

## What I still want to understand

Although I now understand the fundamental workings of GMM, there are still some areas I want to explore further:

1. How different initialization strategies affect the final clusters.
2. Why GMM can converge to a local maximum instead of the global maximum.
3. How to determine the optimal number of Gaussian components.
4. The difference between full, diagonal, spherical, and tied covariance types.
5. How to evaluate a GMM using AIC and BIC.
6. Why numerical underflow occurs when calculating Gaussian densities in high-dimensional datasets, and how log-space calculations solve the problem.

My biggest takeaway from learning GMM is that clustering does not always have to mean assigning an observation to one particular group.

Sometimes, an observation can have different degrees of membership across multiple groups. GMM accounts for this by using probabilities rather than immediately forcing hard assignments.

**For me, the most important thing is not just knowing the formulas, but understanding why each formula exists, what it calculates, when it is used, and how it contributes to the final model.**

You can view a personal implementation of the GMM over [link](https://gist.github.com/Ddilibe/dedb8911b24f1b90d89426ff6cf88c46).